export type Artwork = { id: string; createdAt: number; image: string }

const DB_NAME = 'kinderwelt-artwork'
const STORE = 'drawings'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveArtwork(image: string): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).put({ id: crypto.randomUUID(), createdAt: Date.now(), image } satisfies Artwork)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
}

export async function listArtwork(): Promise<Artwork[]> {
  const db = await openDatabase()
  const result = await new Promise<Artwork[]>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    request.onsuccess = () => resolve((request.result as Artwork[]).sort((a, b) => b.createdAt - a.createdAt))
    request.onerror = () => reject(request.error)
  })
  db.close()
  return result
}

export async function deleteArtwork(id: string): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
}
