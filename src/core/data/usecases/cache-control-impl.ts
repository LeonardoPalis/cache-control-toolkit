import { ConfigRegister } from "../../domain/model/config-register";
import { RegisteredKey } from "../../domain/model/registered-key";
import { ObservableKey } from "../../domain/entities/observable-key";
import { convertTimeToMiliseconds } from "../../domain/entities/time";
import { UnregisterMode } from "../../domain/entities/unregister";
import { CacheControlRegister } from "../../domain/usecases/cache-control-register";
import { KeyRegister } from "../../domain/usecases/key-register";
import { KeyUnregister } from "../../domain/usecases/key-unregister";
import { GetStorage } from "../../infra/storage/get-storage";
import { SetStorage } from "../../infra/storage/set-storage";
import { StorageMapper } from "../../utils/enums/storage-mapper";
import { IConfigRegister } from "../contracts/config-register";
import { ConfigRegisterValidator } from "../validators/config-register-validator";

export class CacheControlRegisterImpl implements CacheControlRegister {
  constructor(
    private readonly setStorage: SetStorage<ConfigRegister> | any,
    private readonly keyRegister: KeyRegister,
    private readonly getStorage: GetStorage,
    private readonly keyUnregister: KeyUnregister,
  ) {}

  private handleObservableChanges(config: IConfigRegister) {
    config.observableKeys.forEach((observableKey: ObservableKey) => {
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

  private handleObservableChangesWithInterval(config: IConfigRegister) {
    const cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
    setInterval(() => {
      this.handleObservableChanges(config);
    }, cicleTimeMiliseconds);
  }

  private handleIntervalRegisterObservable(config: IConfigRegister) {
    const cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
    setInterval(() => {
      this.handleRegister(UnregisterMode.deleteOnTime);
    }, cicleTimeMiliseconds);
  }

  private handleRegister(mode: UnregisterMode) {
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

  private _handleWaitToClose() {
    window.addEventListener("beforeunload", () => {
      this.handleRegister(UnregisterMode.waitToCloseSite);
    });
  }

  register(config: IConfigRegister) {
    if (ConfigRegisterValidator.useConfig(config).isValid()) {
      this.handleObservableChangesWithInterval(config);
    } else {
      console.info("Config register is invalid or has been alread started");
    }
    this.handleIntervalRegisterObservable(config);
    this._handleWaitToClose();
  }
}
