import { StorageMapper } from "../../utils/enums/storage-mapper";
export class KeyRegisterImpl {
    constructor(getRegisterableKeyCount) {
        this.getRegisterableKeyCount = getRegisterableKeyCount;
    }
    _createTag(key) {
        const registerableKeyCount = this.getRegisterableKeyCount.execute();
        return `${StorageMapper.registeredKeyPrefix}${registerableKeyCount}${key}`;
    }
    execute(key) {
        return {
            tag: this._createTag(key),
            expiresAt: new Date(),
            registeredAt: new Date(),
            ttl: new Date(),
        };
    }
    ;
}
