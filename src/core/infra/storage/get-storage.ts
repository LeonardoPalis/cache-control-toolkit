import { StorageKey } from "../../domain/types/storage";

export type GetStorageResponse = string | Array<StorageKey | null> | null;
export interface GetStorage {
  recovery: (key: string, mode?: { includes: boolean }) => GetStorageResponse;
}