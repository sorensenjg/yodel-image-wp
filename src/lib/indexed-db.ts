import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { OutputImage } from "@/types";

interface YodelImageDB extends DBSchema {
  images: {
    key: string; // You can use image IDs or seeds as keys
    value: OutputImage;
    indexes: { "by-seed": number };
  };
}

let dbPromise: Promise<IDBPDatabase<YodelImageDB>>;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<YodelImageDB>("yodel-image-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("images", { keyPath: "seed" });
        store.createIndex("by-seed", "seed");
      },
    });
  }
  return dbPromise;
}

export async function addImage(image: OutputImage) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ImageDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      store.add(image);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getAllImages(): Promise<OutputImage[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ImageDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("images", "readonly");
      const store = transaction.objectStore("images");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const storedImages: OutputImage[] = getAllRequest.result;
        resolve(storedImages);
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function clearImages() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ImageDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains("images")) {
        db.deleteObjectStore("images");
        db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve(true);
      clearRequest.onerror = () => reject(clearRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}
