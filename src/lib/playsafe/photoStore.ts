const DB_NAME = "playsafe-photos";
const DB_VERSION = 2;
const STORE_NAMES = ["checklist", "equipment"] as const;

type StoreName = (typeof STORE_NAMES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      STORE_NAMES.forEach((name) => {
        if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error: unknown) => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

async function transact<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operate: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = operate(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(request ? request.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Blob store in IndexedDB; photos stay in the browser until the assessment is registered. */
function createPhotoStore(storeName: StoreName) {
  return {
    async put(id: string, blob: Blob): Promise<void> {
      await transact(storeName, "readwrite", (store) => store.put(blob, id));
    },
    async get(id: string): Promise<Blob | undefined> {
      const result = await transact<Blob>(storeName, "readonly", (store) => store.get(id));
      return result instanceof Blob ? result : undefined;
    },
    async remove(ids: string[]): Promise<void> {
      if (ids.length === 0) return;
      await transact(storeName, "readwrite", (store) => {
        ids.forEach((id) => store.delete(id));
      });
    },
    async clear(): Promise<void> {
      await transact(storeName, "readwrite", (store) => store.clear());
    },
  };
}

export const checklistPhotoStore = createPhotoStore("checklist");
export const equipmentPhotoStore = createPhotoStore("equipment");
