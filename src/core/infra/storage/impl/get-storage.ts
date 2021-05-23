import { StorageKey } from "../../../domain/types/storage";
import { GetStorage } from "../get-storage";

export class GetStorageImpl implements GetStorage {

  _getAllStorageKeys() {
    return Object.keys(localStorage);
  }

  recovery(key: string, mode?: { includes: boolean }) {
    if (mode?.includes) {
      const allStorageKeys: Array<string> = this._getAllStorageKeys();
      const allStorageValues: Array<StorageKey | null> = [];
      allStorageKeys?.forEach(storageKey => {
        if (storageKey.includes(key)) {
          allStorageValues.push({
            key: storageKey,
            value: localStorage.getItem(storageKey)
        });
        }
      })
      return allStorageValues;
    }

    return localStorage.getItem(key);
  };
}