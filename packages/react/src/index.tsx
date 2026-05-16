import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createApp } from "zerithdb-sdk";
import type { ZerithDBApp, ZerithDBConfig, QueryFilter } from "zerithdb-sdk";
import { liveQuery } from "dexie";

const ZerithContext = createContext<ZerithDBApp | null>(null);

export interface ZerithProviderProps {
  config: ZerithDBConfig;
  children: React.ReactNode;
}

/**
 * Global provider for ZerithDB.
 * Initializes the P2P client and makes it available via hooks.
 */
export const ZerithProvider: React.FC<ZerithProviderProps> = ({ config, children }) => {
  const client = useMemo(() => createApp(config), [JSON.stringify(config)]);

  return <ZerithContext.Provider value={client}>{children}</ZerithContext.Provider>;
};

/**
 * Access the underlying ZerithDB app client directly.
 */
export const useZerith = (): ZerithDBApp => {
  const context = useContext(ZerithContext);
  if (!context) {
    throw new Error("useZerith must be used within a ZerithProvider");
  }
  return context;
};

// Helper hook to deep-compare the filter to avoid unnecessary re-subscriptions
function useDeepCompareMemoize<T>(value: T) {
  const ref = React.useRef<T>(value);
  if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

/**
 * Reactive hook to query a collection.
 * Automatically updates when local or remote (P2P) changes occur.
 * @param collectionName The name of the collection to query
 * @param filter A MongoDB-style query filter. Must be JSON-serializable.
 */
export function useQuery<T extends Record<string, any>>(
  collectionName: string,
  filter: QueryFilter<T> = {}
) {
  const app = useZerith();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedFilter = useDeepCompareMemoize(filter);

  useEffect(() => {
    const collection = app.db<T>(collectionName);

    // Use Dexie's liveQuery to reactively observe local DB changes
    // (which also includes remote P2P updates applied by the sync engine)
    const observable = liveQuery(() => collection.find(memoizedFilter));

    const subscription = observable.subscribe({
      next: (docs) => {
        setData(docs as T[]);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [app, collectionName, memoizedFilter]);

  const insert = async (item: T) => {
    return app.db<T>(collectionName).insert(item);
  };

  const remove = async (id: string) => {
    const collection = app.db<T>(collectionName);
    type DeleteFilter = Parameters<typeof collection.delete>[0];
    const deleteFilter = { _id: id } as unknown as DeleteFilter;
    return collection.delete(deleteFilter);
  };

  return { data, loading, error, insert, remove };
}

/**
 * Hook to access and manage P2P sync state
 */
export function useSync() {
  const app = useZerith();
  const [state, setState] = useState(() => app.sync.state);

  useEffect(() => {
    const handleStateChange = (newState: any) => setState(newState);
    app.sync.on("state:change", handleStateChange);
    return () => {
      app.sync.off("state:change", handleStateChange);
    };
  }, [app]);

  return {
    state,
    enable: () => app.sync.enable(),
    disable: () => app.sync.disable(),
  };
}

/**
 * Hook to manage authentication and identity
 */
export function useAuth() {
  const app = useZerith();
  const [identity, setIdentity] = useState(() => app.auth.identity);

  useEffect(() => {
    const handleIdentityChange = (newIdentity: any) => setIdentity(newIdentity);
    app.auth.on("identity:change", handleIdentityChange);
    // Initialize in case it changed between render and effect
    setIdentity(app.auth.identity);
    return () => {
      app.auth.off("identity:change", handleIdentityChange);
    };
  }, [app]);

  const signIn = async () => {
    const id = await app.auth.signIn();
    // No need to setIdentity here, the event listener will handle it
    return id;
  };

  const signOut = async () => {
    await app.auth.signOut();
  };

  return { identity, signIn, signOut };
}
