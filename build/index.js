import { CacheControlRegisterImpl } from "./src/core/data/usecases/cache-control-impl";
import { GetRegisteredKeyCountImpl } from "./src/core/data/usecases/get-registered-key-count-impl";
import { KeyRegisterImpl } from "./src/core/data/usecases/key-register-impl";
import { ConfigRegister } from "./src/core/domain/model/config-register";
import { TTLTypes } from "./src/core/domain/types/ttl";
import { ClearStorageImpl } from "./src/core/infra/storage/impl/clear-storage";
import { GetStorageImpl } from "./src/core/infra/storage/impl/get-storage";
import { SetStorageImpl } from "./src/core/infra/storage/impl/set-storage";
const setStorage = new SetStorageImpl();
const getStorage = new GetStorageImpl();
const clearStorage = new ClearStorageImpl();
const getRegisterableKeyCount = new GetRegisteredKeyCountImpl(getStorage);
const keyRegister = new KeyRegisterImpl(getRegisterableKeyCount);
const cacheControl = new CacheControlRegisterImpl(setStorage, clearStorage, keyRegister);
const config = new ConfigRegister({
    time: 5,
    type: TTLTypes.S,
}, ["test"]);
cacheControl.register(config);
