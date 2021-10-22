import { CacheControlRegisterImpl } from "../core/data/usecases/cache-control-impl";
import { KeyRegisterImpl } from "../core/data/usecases/key-register-impl";
import { KeyUnregisterImpl } from "../core/data/usecases/key-unregister";
import { ConfigRegister } from "../core/domain/model/config-register";
import { CacheControlRegister } from "../core/domain/usecases/cache-control-register";
import { KeyRegister } from "../core/domain/usecases/key-register";
import { KeyUnregister } from "../core/domain/usecases/key-unregister";
import { ClearStorage } from "../core/infra/storage/clear-storage";
import { GetStorage } from "../core/infra/storage/get-storage";
import { ClearStorageImpl } from "../core/infra/storage/impl/clear-storage";
import { GetStorageImpl } from "../core/infra/storage/impl/get-storage";
import { SetStorageImpl } from "../core/infra/storage/impl/set-storage";
import { SetStorage } from "../core/infra/storage/set-storage";

export class CacheControlToolkit {
  static register(config: ConfigRegister) {
    const setStorage: SetStorage<ConfigRegister> = new SetStorageImpl();
    const getStorage: GetStorage = new GetStorageImpl();
    const clearStorage: ClearStorage = new ClearStorageImpl();
    const keyRegister: KeyRegister = new KeyRegisterImpl();
    const keyUnregister: KeyUnregister = new KeyUnregisterImpl(getStorage, clearStorage);
    const cacheControl: CacheControlRegister = new CacheControlRegisterImpl(
      setStorage,
      keyRegister,
      getStorage,
      keyUnregister,
    );
    cacheControl.register(config);
  }
}


