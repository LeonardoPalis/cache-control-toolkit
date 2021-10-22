import { RegisteredKey } from "../../domain/model/registered-key";
import { KeyUnregister } from "../../domain/usecases/key-unregister";
import { ClearStorage } from "../../infra/storage/clear-storage";
import { GetStorage, GetStorageResponse } from "../../infra/storage/get-storage";

export class KeyUnregisterImpl implements KeyUnregister {

  constructor(
    private readonly getStorage: GetStorage, 
    private readonly clearStorage: ClearStorage) { }

  private validRegisteredKey(registeredKey: GetStorageResponse) : boolean {
    return (registeredKey && typeof registeredKey === "string") as boolean;
  };

  private hasExpiredRegisteredKey(registeredKeyExpirationTime: number) {
    const currentDateTime = new Date().getTime();
    return currentDateTime >= registeredKeyExpirationTime;
  }

  execute(key: string): void {
    const registeredKey: GetStorageResponse = this.getStorage.recovery(key);
    if (this.validRegisteredKey(registeredKey)) {
      const parsedKeyRegister: RegisteredKey = JSON.parse(registeredKey as string);
      const currentDateTime = new Date().getTime();
      const registeredKeyExpirationTime = new Date(parsedKeyRegister.expiresAt).getTime();
      if (this.hasExpiredRegisteredKey(registeredKeyExpirationTime)) {
        this.clearStorage.cleanByKey(parsedKeyRegister.ref);
        this.clearStorage.cleanByKey(key);
      }
    }
  }
}