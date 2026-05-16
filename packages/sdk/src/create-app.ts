import { Logger } from "zerithdb-core";
import type { ZerithDBConfig } from "zerithdb-core";
import { ZerithDBError, ErrorCode } from "zerithdb-core";
import { DbClient, CollectionClient } from "./db-client.js";
import { SyncEngine } from "./sync-engine.js";
import { AuthManager } from "./auth-manager.js";
import { NetworkManager } from "./network-manager.js";

/**
 * The root ZerithDB application instance returned by {@link createApp}.
 */
export interface ZerithDBApp {
  /**
   * Access a database collection by name.
   * The collection is created lazily on first use.
   *
   * @param name - Collection name (e.g. `"todos"`, `"messages"`)
   * @returns A typed {@link DbClient} for querying and mutating documents.
   *
   * @example
   * ```typescript
   * const todos = app.db("todos");
   * await todos.insert({ text: "Hello", done: false });
   * const all = await todos.find({});
   * ```
   */
  db<T extends Record<string, any> = Record<string, any>>(name: string): CollectionClient<T>;

  /** CRDT sync engine — manages Yjs documents and P2P update propagation */
  sync: SyncEngine;

  /** Authentication manager — keypair identity and message signing */
  auth: AuthManager;

  /** P2P network manager — WebRTC peer connections and signaling */
  network: NetworkManager;

  /** Underlying app configuration */
  config: Readonly<ZerithDBConfig>;

  /**
   * Tear down the application — close all peer connections, stop sync,
   * and release database handles.
   */
  dispose(): Promise<void>;
}

/**
 * Creates a new ZerithDB application instance.
 *
 * This is the primary entry point to the ZerithDB SDK.
 * All database, sync, auth, and network operations flow through this instance.
 *
 * @param config - Application configuration
 * @returns A configured {@link ZerithDBApp}
 *
 * @example
 * ```typescript
 * import { createApp } from "zerithdb-sdk";
 *
 * const app = createApp({
 *   appId: "my-todo-app",
 *   sync: { signalingUrl: "wss://signal.zerithdb.dev" },
 * });
 *
 * await app.db("todos").insert({ text: "Ship ZerithDB v1", done: false });
 * app.sync.enable();
 * ```
 */
export function createApp(config: ZerithDBConfig): ZerithDBApp {
  if (!config.appId || config.appId.trim().length === 0) {
    throw new ZerithDBError(
      ErrorCode.SDK_INVALID_CONFIG,
      'createApp requires a non-empty "appId" in config'
    );
  }
  const resolvedConfig: ZerithDBConfig = {
    logLevel: "warn",
    ...config,
    sync: {
      signalingUrl: "wss://signal.zerithdb.dev",
      maxPeers: 10,
      transport: "auto",
      ...config.sync,
    },
    auth: {
      storageKey: "__zerithdb_identity",
      ...config.auth,
    },
    network: {
      autoReconnect: true,
      reconnectDelay: 1000,
      ...config.network,
    },
  };

  const logger = new Logger(resolvedConfig, "SDK");
  logger.info("Initializing ZerithDB app", { appId: resolvedConfig.appId });

  const auth = new AuthManager(resolvedConfig);
  const db = new DbClient(resolvedConfig);
  const network = new NetworkManager(resolvedConfig, auth);
  const sync = new SyncEngine(resolvedConfig, db, network);

  const collectionCache = new Map<string, CollectionClient<any>>();

  return {
    config: Object.freeze(resolvedConfig),

    db<T extends Record<string, any>>(name: string): CollectionClient<T> {
      if (!collectionCache.has(name)) {
        collectionCache.set(name, db.collection(name));
      }
      // biome-ignore lint: cache guarantees this is defined
      return collectionCache.get(name) as CollectionClient<T>;
    },

    sync,
    auth,
    network,

    async dispose(): Promise<void> {
      await Promise.all([sync.dispose(), network.dispose(), db.dispose()]);
    },
  };
}
