import { StorageKey } from "../../domain/types/storage";

export interface GetStorage {
  recovery: (key: string, mode?: { includes: boolean }) => string | Array<StorageKey | null> | null;
}