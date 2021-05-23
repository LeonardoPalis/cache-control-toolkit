import { CacheControlRegisterImpl } from "./src/core/data/usecases/cache-control-impl";
import { KeyRegisterImpl } from "./src/core/data/usecases/key-register-impl";
import { KeyUnregisterImpl } from "./src/core/data/usecases/key-unregister";
import { ConfigRegister } from "./src/core/domain/model/config-register";
import { TimeTypes } from "./src/core/domain/types/time";
import { UnregisterMode } from "./src/core/domain/types/unregister";
import { CacheControlRegister } from "./src/core/domain/usecases/cache-control-register";
import { KeyRegister } from "./src/core/domain/usecases/key-register";
import { KeyUnregister } from "./src/core/domain/usecases/key-unregister";
import { ClearStorage } from "./src/core/infra/storage/clear-storage";
import { GetStorage } from "./src/core/infra/storage/get-storage";
import { ClearStorageImpl } from "./src/core/infra/storage/impl/clear-storage";
import { GetStorageImpl } from "./src/core/infra/storage/impl/get-storage";
import { SetStorageImpl } from "./src/core/infra/storage/impl/set-storage";
import { SetStorage } from "./src/core/infra/storage/set-storage";

const setStorage: SetStorage<ConfigRegister> = new SetStorageImpl();
const setStorageString: SetStorage<string> = new SetStorageImpl();
const getStorage: GetStorage = new GetStorageImpl();
const clearStorage: ClearStorage = new ClearStorageImpl();
const keyRegister: KeyRegister = new KeyRegisterImpl();
const keyUnregister: KeyUnregister = new KeyUnregisterImpl(getStorage, setStorageString, clearStorage);
const cacheControl: CacheControlRegister = new CacheControlRegisterImpl(
  setStorage,
  clearStorage,
  keyRegister,
  getStorage,
  keyUnregister,
);

const config: ConfigRegister = new ConfigRegister(
  {
    time: 5,
    type: TimeTypes.S,
  },
  [{
    key: 'haha',
    ttl: {
      time: 15,
      type: TimeTypes.S
    },
    unregister: {
      mode: UnregisterMode.waitToCloseSite,
    }
  },
  {
    key: 'test',
    ttl: {
      time: 10,
      type: TimeTypes.S
    },
    unregister: {
      mode: UnregisterMode.deleteOnTime,
    }
  }]
);

cacheControl.register(config);
