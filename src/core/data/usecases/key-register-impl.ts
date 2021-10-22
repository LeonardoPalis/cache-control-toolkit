import { RegisteredKey } from "../../domain/model/registered-key";
import { ObservableKey } from "../../domain/types/observable-key";
import { convertTimeToMiliseconds, TimeTypes } from "../../domain/types/time";
import { KeyRegister } from "../../domain/usecases/key-register";
import { StorageMapper } from "../../utils/enums/storage-mapper";

export class KeyRegisterImpl implements KeyRegister {
  private createTag(key: string): string {
    return `${StorageMapper.registeredKeyPrefix}${key}`;
  }

  execute(observableKey: ObservableKey) : RegisteredKey {
    const expiresAt = new Date(new Date().getTime() + convertTimeToMiliseconds(observableKey.ttl));
    return {
      tag: this.createTag(observableKey.key),
      expiresAt,
      registeredAt: new Date(),
      unregistered: observableKey.unregister,
      ttl: {
        time: 5,
        type: TimeTypes.S
      },
      ref: observableKey.key,
    }
  };

}