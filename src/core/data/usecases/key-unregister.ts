import { RegisteredKey } from "../../domain/model/registered-key";
import { KeyUnregister } from "../../domain/usecases/key-unregister";
import { ClearStorage } from "../../infra/storage/clear-storage";
import { GetStorage } from "../../infra/storage/get-storage";
import { SetStorage } from "../../infra/storage/set-storage";

export class KeyUnregisterImpl implements KeyUnregister {
  getStorage: GetStorage;
  setStorage: SetStorage<string>;
  clearStorage: ClearStorage;

  constructor(getStorage: GetStorage, setStorage: SetStorage<string>, clearStorage: ClearStorage) {
    this.getStorage = getStorage;
    this.setStorage = setStorage;
    this.clearStorage = clearStorage;
  }

  execute(key: string): void {
    const keyRegister = this.getStorage.recovery(key);
    if (keyRegister && typeof keyRegister === "string") {
      const parsedKeyRegister: RegisteredKey = JSON.parse(keyRegister);
      const now = new Date().getTime();
      const keyRegisterExpires = new Date(parsedKeyRegister.expiresAt).getTime();
      if (now >= keyRegisterExpires) {
        this.clearStorage.cleanByKey(parsedKeyRegister.ref);
        this.clearStorage.cleanByKey(key);
      }
    }
  }
}