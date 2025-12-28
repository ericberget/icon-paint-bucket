/**
 * IndexedDB storage utility for persisting icons
 * Stores icons locally in the browser with no size limits
 */

const DB_NAME = 'icon-zap-db';
const DB_VERSION = 1;
const ICONS_STORE = 'icons';

/**
 * Open the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create icons store if it doesn't exist
      if (!db.objectStoreNames.contains(ICONS_STORE)) {
        const store = db.createObjectStore(ICONS_STORE, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

/**
 * Save all icons to IndexedDB
 * @param {Array} icons - Array of icon objects
 * @returns {Promise<void>}
 */
export const saveIcons = async (icons) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(ICONS_STORE, 'readwrite');
    const store = transaction.objectStore(ICONS_STORE);

    // Clear existing icons and save new ones
    store.clear();
    
    icons.forEach((icon) => {
      store.put({
        ...icon,
        savedAt: Date.now(),
      });
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Failed to save icons:', error);
    throw error;
  }
};

/**
 * Load all icons from IndexedDB
 * @returns {Promise<Array>} Array of icon objects
 */
export const loadIcons = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(ICONS_STORE, 'readonly');
    const store = transaction.objectStore(ICONS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load icons:', error);
    return [];
  }
};

/**
 * Delete a single icon from IndexedDB
 * @param {string} iconId - The ID of the icon to delete
 * @returns {Promise<void>}
 */
export const deleteIcon = async (iconId) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(ICONS_STORE, 'readwrite');
    const store = transaction.objectStore(ICONS_STORE);
    store.delete(iconId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Failed to delete icon:', error);
    throw error;
  }
};

/**
 * Clear all icons from IndexedDB
 * @returns {Promise<void>}
 */
export const clearAllIcons = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(ICONS_STORE, 'readwrite');
    const store = transaction.objectStore(ICONS_STORE);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Failed to clear icons:', error);
    throw error;
  }
};

/**
 * Get the count of stored icons
 * @returns {Promise<number>}
 */
export const getIconCount = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(ICONS_STORE, 'readonly');
    const store = transaction.objectStore(ICONS_STORE);
    const request = store.count();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get icon count:', error);
    return 0;
  }
};

export default {
  saveIcons,
  loadIcons,
  deleteIcon,
  clearAllIcons,
  getIconCount,
};

