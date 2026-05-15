import type { Document } from "zerithdb-core";

export type BackupSnapshot = {
  format: "zerithdb.local-backup.v1";
  appId: string;
  generatedAt: string;
  collections: Record<string, Document<Record<string, any>>[]>;
};

export type BackupExportOptions = {
  /**
   * Collection names to include in the backup. When omitted, ZerithDB backs up
   * the collections opened through the current DbClient instance.
   */
  collections?: string[];
};

export type BackupUploadInput = {
  fileName: string;
  content: string;
  contentType: "application/json";
  snapshot: BackupSnapshot;
};

export type BackupUploadResult = {
  provider: string;
  fileName: string;
  uploadedAt: string;
  location?: string;
  metadata?: unknown;
};

export interface CloudBackupTarget {
  readonly provider: string;
  uploadBackup(input: BackupUploadInput): Promise<BackupUploadResult>;
}

export type LocalCloudBackupOptions = BackupExportOptions & {
  /**
   * How often start() should upload a backup. Defaults to 15 minutes.
   */
  intervalMs?: number;
  fileName?: string | ((snapshot: BackupSnapshot) => string);
  onError?: (error: unknown) => void;
};

type SnapshotExporter = {
  exportSnapshot(options?: BackupExportOptions): Promise<BackupSnapshot>;
};

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

export class LocalCloudBackupAdapter {
  private timer: ReturnType<typeof setInterval> | undefined;
  private inFlight: Promise<BackupUploadResult> | undefined;

  constructor(
    private readonly db: SnapshotExporter,
    private readonly target: CloudBackupTarget,
    private readonly options: LocalCloudBackupOptions = {}
  ) {}

  async backupNow(): Promise<BackupUploadResult> {
    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.runBackup().finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  start(): void {
    if (this.timer) {
      return;
    }

    const intervalMs = this.options.intervalMs ?? DEFAULT_INTERVAL_MS;
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      throw new Error("Backup interval must be a positive number of milliseconds");
    }

    this.timer = setInterval(() => {
      void this.backupNow().catch((error) => this.options.onError?.(error));
    }, intervalMs);
  }

  stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = undefined;
  }

  get running(): boolean {
    return this.timer !== undefined;
  }

  private async runBackup(): Promise<BackupUploadResult> {
    const snapshot = await this.db.exportSnapshot({ collections: this.options.collections });
    const content = JSON.stringify(snapshot, null, 2);
    return this.target.uploadBackup({
      fileName: this.resolveFileName(snapshot),
      content,
      contentType: "application/json",
      snapshot,
    });
  }

  private resolveFileName(snapshot: BackupSnapshot): string {
    if (typeof this.options.fileName === "function") {
      return this.options.fileName(snapshot);
    }
    if (this.options.fileName) {
      return this.options.fileName;
    }

    const stamp = snapshot.generatedAt.replace(/[:.]/g, "-");
    return `zerithdb-${snapshot.appId}-${stamp}.json`;
  }
}

export type GoogleDriveBackupTargetOptions = {
  accessToken: string;
  folderId?: string;
  fetchImpl?: typeof fetch;
};

export class GoogleDriveBackupTarget implements CloudBackupTarget {
  readonly provider = "google-drive";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: GoogleDriveBackupTargetOptions) {
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  async uploadBackup(input: BackupUploadInput): Promise<BackupUploadResult> {
    ensureFetch(this.fetchImpl, this.provider);

    const boundary = `zerithdb_${Date.now().toString(36)}`;
    const metadata = {
      name: input.fileName,
      mimeType: input.contentType,
      ...(this.options.folderId ? { parents: [this.options.folderId] } : {}),
    };

    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      `Content-Type: ${input.contentType}`,
      "",
      input.content,
      `--${boundary}--`,
    ].join("\r\n");

    const response = await this.fetchImpl(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    const metadataResponse = await readResponse(response);
    assertUploadOk(response, this.provider, metadataResponse);

    return {
      provider: this.provider,
      fileName: input.fileName,
      uploadedAt: new Date().toISOString(),
      location:
        getStringProperty(metadataResponse, "webViewLink") ??
        getStringProperty(metadataResponse, "id"),
      metadata: metadataResponse,
    };
  }
}

export type DropboxBackupTargetOptions = {
  accessToken: string;
  folderPath?: string;
  fetchImpl?: typeof fetch;
};

export class DropboxBackupTarget implements CloudBackupTarget {
  readonly provider = "dropbox";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: DropboxBackupTargetOptions) {
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  async uploadBackup(input: BackupUploadInput): Promise<BackupUploadResult> {
    ensureFetch(this.fetchImpl, this.provider);

    const path = joinDropboxPath(this.options.folderPath ?? "", input.fileName);
    const response = await this.fetchImpl("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: "overwrite",
          autorename: false,
          mute: true,
        }),
      },
      body: input.content,
    });

    const metadataResponse = await readResponse(response);
    assertUploadOk(response, this.provider, metadataResponse);

    return {
      provider: this.provider,
      fileName: input.fileName,
      uploadedAt: new Date().toISOString(),
      location: getStringProperty(metadataResponse, "path_display") ?? path,
      metadata: metadataResponse,
    };
  }
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function assertUploadOk(response: Response, provider: string, metadata: unknown): void {
  if (response.ok) {
    return;
  }

  const detail = typeof metadata === "string" ? metadata : JSON.stringify(metadata);
  throw new Error(
    `${provider} backup upload failed (${response.status} ${response.statusText}): ${detail}`
  );
}

function ensureFetch(
  fetchImpl: typeof fetch | undefined,
  provider: string
): asserts fetchImpl is typeof fetch {
  if (!fetchImpl) {
    throw new Error(`${provider} backup target requires a fetch implementation`);
  }
}

function getStringProperty(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  const property = (value as Record<string, unknown>)[key];
  return typeof property === "string" ? property : undefined;
}

function joinDropboxPath(folderPath: string, fileName: string): string {
  const normalizedFolder = folderPath.trim().replace(/\/+$/, "");
  const safeFileName = fileName.replace(/^\/+/, "");

  if (!normalizedFolder || normalizedFolder === "/") {
    return `/${safeFileName}`;
  }

  return `${normalizedFolder.startsWith("/") ? normalizedFolder : `/${normalizedFolder}`}/${safeFileName}`;
}
