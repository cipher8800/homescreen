const DB = (() => {
  const DB_NAME = projectName;
  const DB_VERSION = 1;
  const STORES = ["currentItems", "settings"];

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
          }
        });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getStore(storeName) {
    const db = await openDB();
    const tx = db.transaction(storeName, "readwrite");
    return tx.objectStore(storeName);
  }

  function handleRequest(callback) {
    return new Promise((resolve, reject) => {
      const request = callback();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getItem(storeName, id) {
    const store = await getStore(storeName);
    return handleRequest(() => store.get(id));
  }

  async function getItems(storeName) {
    const store = await getStore(storeName);
    return handleRequest(() => store.getAll());
  }

  async function addItem(storeName, item) {
    const store = await getStore(storeName);
    return handleRequest(() => store.add(item));
  }

  async function putItem(storeName, item) {
    const store = await getStore(storeName);
    return handleRequest(() => store.put(item));
  }

  async function deleteItem(storeName, id) {
    const store = await getStore(storeName);
    return handleRequest(() => store.delete(id));
  }

  return { addItem, getItem, getItems, putItem, deleteItem };
})();
