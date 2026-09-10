import { type IDBPDatabase, openDB } from "idb";
import type { Universe } from "@/types/universe";

const DB_NAME = "money-heist-universe-cache";
const STORE = "universe";
const KEY = "current";

export interface CachedUniverse {
  universe: Universe;
  /** CORS-safelisted freshness fingerprint (ETag is not exposed by this host — see loader). */
  lastModified: string | null;
  contentLength: string | null;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  dbPromise ??= openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
  return dbPromise;
}

export async function readCachedUniverse(): Promise<CachedUniverse | null> {
  try {
    const db = await getDb();
    const value = await db.get(STORE, KEY);
    return (value as CachedUniverse) ?? null;
  } catch {
    return null;
  }
}

export async function writeCachedUniverse(entry: CachedUniverse): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, entry, KEY);
  } catch {
    // Cache is a best-effort optimization; loading still works without it.
  }
}

export async function clearCachedUniverse(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE, KEY);
  } catch {
    // ignore
  }
}
