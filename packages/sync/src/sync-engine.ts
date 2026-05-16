import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import type { ZerithDBConfig, SyncState } from "zerithdb-core";
import { EventEmitter } from "zerithdb-core";
import type { DbClient } from "zerithdb-db";
import type { NetworkManager } from "zerithdb-network";

type SyncEvents = {
  "state:change": SyncState;
  "update:local": { collectionName: string; update: Uint8Array };
  "update:remote": { collectionName: string; update: Uint8Array; fromPeer: string };
};

/**
 * CRDT sync engine — manages one Yjs Y.Doc per collection.
 * Local writes update the Y.Doc, which generates binary deltas sent to peers.
 * Incoming peer deltas are applied to the Y.Doc, which reactively updates the DB.
 */
export class SyncEngine extends EventEmitter<SyncEvents> {
  private readonly docs = new Map<string, Y.Doc>();
  private readonly persistences = new Map<string, IndexeddbPersistence>();
  private _enabled = false;
  private _state: SyncState = { synced: false, pendingUpdates: 0, connectedPeers: 0 };
  private pendingUpdates = new Map<string, Uint8Array[]>();
  private syncTimer: any = null;
  private syncTimerIsRaf: boolean = false;

  constructor(
    private readonly config: ZerithDBConfig,
    private readonly db: DbClient,
    private readonly network: NetworkManager
  ) {
    super();
    this.onPeerUpdate = this.onPeerUpdate.bind(this);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") {
      // Resume sync: Flush any local updates that accumulated while hidden.
      // We don't need to 'enable()' because we never tore down incoming listeners.
      if (this.pendingUpdates.size > 0 && !this.syncTimer) {
        this.flushUpdates();
      }
    } else if (document.visibilityState === "hidden") {
      // Pause outgoing sync: Clear the timer so it doesn't wake the CPU/radio.
      // (requestAnimationFrame automatically pauses natively, but clearing it explicitly
      // ensures the setTimeout fallback is safely neutralized).
      if (this.syncTimer) {
        if (this.syncTimerIsRaf && typeof window !== "undefined" && window.cancelAnimationFrame) {
          window.cancelAnimationFrame(this.syncTimer);
        } else {
          clearTimeout(this.syncTimer);
        }
        this.syncTimer = null;
        this.syncTimerIsRaf = false;
      }
    }
  };

  /**
   * Enable P2P sync. After calling this, local changes are broadcast
   * to connected peers and remote updates are applied locally.
   */
  enable(): void {
    if (this._enabled) return;
    this._enabled = true;
    this.network.on("message", this.onPeerUpdate);
    this.updateState({ synced: true });
  }

  /** Disable sync without disconnecting from peers */
  disable(): void {
    this._enabled = false;
    this.network.off("message", this.onPeerUpdate);
    this.updateState({ synced: false });
  }

  /** Current sync state snapshot */
  get state(): Readonly<SyncState> {
    return this._state;
  }

  /**
   * Get or create the Yjs document for a collection.
   * Documents are persisted to IndexedDB via y-indexeddb.
   */
  getDoc(collectionName: string): Y.Doc {
    if (this.docs.has(collectionName)) {
      // biome-ignore lint: map guarantees defined
      return this.docs.get(collectionName)!;
    }

    const doc = new Y.Doc({ guid: `${this.config.appId}:${collectionName}` });

    // Persist to IndexedDB
    const persistence = new IndexeddbPersistence(
      `zerithdb_sync_${this.config.appId}_${collectionName}`,
      doc
    );
    this.persistences.set(collectionName, persistence);

    // Broadcast local updates to peers (batched via requestAnimationFrame)
    doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return; // Don't echo back remote updates
      if (!this._enabled) return;

      this.queueUpdate(collectionName, update);
    });

    this.docs.set(collectionName, doc);
    return doc;
  }

  /**
   * Apply a remote CRDT update to the local document.
   * Called by the network layer when a peer sends an update.
   */
  applyRemoteUpdate(collectionName: string, update: Uint8Array, fromPeer: string): void {
    const doc = this.getDoc(collectionName);
    Y.applyUpdate(doc, update, "remote");
    this.emit("update:remote", { collectionName, update, fromPeer });
  }

  async dispose(): Promise<void> {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    this.disable();
    if (this.syncTimer) {
      if (this.syncTimerIsRaf && typeof window !== "undefined" && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(this.syncTimer);
      } else {
        clearTimeout(this.syncTimer);
      }
      this.syncTimer = null;
      this.syncTimerIsRaf = false;
    }
    for (const [, persistence] of this.persistences) {
      await persistence.destroy();
    }
    for (const [, doc] of this.docs) {
      doc.destroy();
    }
    this.docs.clear();
    this.persistences.clear();
    this.pendingUpdates.clear();
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private queueUpdate(collectionName: string, update: Uint8Array): void {
    let updates = this.pendingUpdates.get(collectionName);
    if (!updates) {
      updates = [];
      this.pendingUpdates.set(collectionName, updates);
    }
    updates.push(update);

    // Only schedule the next outgoing flush if the tab is visible.
    // If hidden, the updates safely accumulate in the map without battery drain.
    if (
      !this.syncTimer &&
      (typeof document === "undefined" || document.visibilityState !== "hidden")
    ) {
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        this.syncTimer = window.requestAnimationFrame(() => this.flushUpdates());
        this.syncTimerIsRaf = true;
      } else {
        this.syncTimer = setTimeout(() => this.flushUpdates(), 50);
        this.syncTimerIsRaf = false;
      }
    }
  }

  private flushUpdates(): void {
    this.syncTimer = null;
    for (const [collectionName, updates] of this.pendingUpdates.entries()) {
      // Y.mergeUpdates merges all updates into a single efficient payload
      const merged = Y.mergeUpdates(updates);
      this.emit("update:local", { collectionName, update: merged });
      this.network.broadcast({
        type: "sync-update",
        payload: this.encodeMessage(collectionName, merged),
      });
    }
    this.pendingUpdates.clear();
  }

  private onPeerUpdate(msg: { type: string; payload: Uint8Array | string; from: string }): void {
    if (msg.type !== "sync-update") return;

    const payload = typeof msg.payload === "string" ? base64ToBytes(msg.payload) : msg.payload;

    const decoded = this.decodeMessage(payload);
    if (decoded === null) return;

    this.applyRemoteUpdate(decoded.collectionName, decoded.update, msg.from);
  }

  private encodeMessage(collectionName: string, update: Uint8Array): string {
    const nameBytes = new TextEncoder().encode(collectionName);
    const header = new Uint8Array([nameBytes.length]);
    const combined = new Uint8Array(1 + nameBytes.length + update.length);
    combined.set(header, 0);
    combined.set(nameBytes, 1);
    combined.set(update, 1 + nameBytes.length);
    return bytesToBase64(combined);
  }

  private decodeMessage(bytes: Uint8Array): {
    collectionName: string;
    update: Uint8Array;
  } | null {
    try {
      const nameLen = bytes[0];
      if (nameLen === undefined) return null;
      const nameBytes = bytes.slice(1, 1 + nameLen);
      const update = bytes.slice(1 + nameLen);
      return {
        collectionName: new TextDecoder().decode(nameBytes),
        update,
      };
    } catch {
      return null;
    }
  }

  private updateState(partial: Partial<SyncState>): void {
    this._state = { ...this._state, ...partial };
    this.emit("state:change", this._state);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
