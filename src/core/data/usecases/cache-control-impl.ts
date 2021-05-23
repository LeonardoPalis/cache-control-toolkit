import { ConfigRegister } from "../../domain/model/config-register";
import { RegisteredKey } from "../../domain/model/registered-key";
import { convertTimeToMiliseconds } from "../../domain/types/time";
import { UnregisterMode } from "../../domain/types/unregister";
import { CacheControlRegister } from "../../domain/usecases/cache-control-register";
import { KeyRegister } from "../../domain/usecases/key-register";
import { KeyUnregister } from "../../domain/usecases/key-unregister";
import { ClearStorage } from "../../infra/storage/clear-storage";
import { GetStorage } from "../../infra/storage/get-storage";
import { SetStorage } from "../../infra/storage/set-storage";
import { StorageMapper } from "../../utils/enums/storage-mapper";

export class CacheControlRegisterImpl implements CacheControlRegister {
  setStorage: SetStorage<ConfigRegister | any>;
  getStorage: GetStorage;
  clearStorage: ClearStorage;
  keyRegister: KeyRegister;
  keyUnregister: KeyUnregister;

  constructor(
    setStorage: SetStorage<ConfigRegister>,
    clearStorage: ClearStorage,
    keyRegister: KeyRegister,
    getStorage: GetStorage,
    keyUnregister: KeyUnregister
  ) {
    this.setStorage = setStorage;
    this.clearStorage = clearStorage;
    this.keyRegister = keyRegister;
    this.getStorage = getStorage;
    this.keyUnregister = keyUnregister;
  }

  _handleObservableChanges(config: ConfigRegister) {
    config.observableKeys.forEach((observableKey) => {
      const observableKeyTargetValue = this.getStorage.recovery(
        observableKey.key
      );
      const allKeyRegister = this.getStorage.recovery(
        StorageMapper.registeredKeyPrefix,
        { includes: true }
      );
      if (allKeyRegister && typeof allKeyRegister === "object") {
        if (observableKeyTargetValue !== null) {
          const observableKeyRegistered = allKeyRegister.find((keyRegister) => {
            const parsedKeyRegister: RegisteredKey = JSON.parse(
              keyRegister?.value
            );
            return parsedKeyRegister.ref === observableKey.key;
          });
          if (!observableKeyRegistered) {
            const { tag, ..._registeredKey }: RegisteredKey =
              this.keyRegister.execute(observableKey);
            this.setStorage.save(tag, _registeredKey);
          }
        }
      }
    });
  }

  _handleObservableChangesWithInterval(config: ConfigRegister) {
    const cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
    setInterval(() => {
      this._handleObservableChanges(config);
    }, cicleTimeMiliseconds)
  }

  _handleIntervalRegisterObservable(config: ConfigRegister) {
    const cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
    setInterval(() => {
      this._handleRegister(UnregisterMode.deleteOnTime);
    }, cicleTimeMiliseconds);
  }

  _handleRegister(mode: UnregisterMode) {
    const allKeyRegister = this.getStorage.recovery(
      StorageMapper.registeredKeyPrefix,
      { includes: true }
    );
    if (allKeyRegister && typeof allKeyRegister === "object") {
      allKeyRegister.forEach((keyRegister) => {
        const keyRegisterValue: RegisteredKey = JSON.parse(keyRegister?.value);
        if (keyRegisterValue.unregistered?.mode === mode) {
          this.keyUnregister.execute(keyRegister?.key || "");
        }
      });
    }
  }

  _handleWaitToClose() {
    window.addEventListener("beforeunload", () => {
      this._handleRegister(UnregisterMode.waitToCloseSite);
    });
  }

  register(config: ConfigRegister) {
    if (config.isValid()) {
      this._handleObservableChangesWithInterval(config);
    } else {
      console.info("Config register is invalid or has been alread started");
    }
    this._handleIntervalRegisterObservable(config);
    this._handleWaitToClose();
  }
}
