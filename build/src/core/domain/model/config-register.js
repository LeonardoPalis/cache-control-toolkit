import { TTLTypes } from "../types/ttl";
const defaultTTL = {
    type: TTLTypes.M,
    time: 5
};
export class ConfigRegister {
    constructor(ttl, observableKeys) {
        this.ttl = defaultTTL;
        this.observableKeys = [];
        this.ttl = ttl;
        this.observableKeys = observableKeys;
    }
    isValid() {
        return Object.values(TTLTypes).includes(this.ttl.type) && this.ttl.time > 0;
    }
}
