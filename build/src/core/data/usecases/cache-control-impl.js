import { StorageMapper } from "../../utils/enums/storage-mapper";
export class CacheControlRegisterImpl {
    constructor(setStorage, clearStorage, keyRegister) {
        this.setStorage = setStorage;
        this.clearStorage = clearStorage;
        this.keyRegister = keyRegister;
    }
    _handleObservableChanges(config) {
        config.observableKeys.forEach(observableKey => {
            this.keyRegister.execute(observableKey);
        });
    }
    _handleRegister() {
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState == 'hidden') {
            }
        });
    }
    register(config) {
        if (config.isValid()) {
            this.setStorage.save(StorageMapper.config, config);
            this._handleObservableChanges(config);
        }
        else {
            console.info('Config register is invalid, service not started');
        }
    }
}
