import { ClearStorage } from "../clear-storage";

export class ClearStorageImpl implements ClearStorage {
  cleanByKey(key: string) {
    localStorage.removeItem(key);
  };

  cleanAll() {
    localStorage.clear();
  }
}