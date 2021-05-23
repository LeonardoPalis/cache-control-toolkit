import { SetStorage } from "../set-storage";

export class SetStorageImpl<T> implements SetStorage<T> {
  save(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  };
}