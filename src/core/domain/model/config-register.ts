import { ObservableKey } from "../types/observable-key";
import { Time, TimeTypes } from "../types/time";

const defaultTTL: Time = {
  type: TimeTypes.M,
  time: 5
}

const defaultCicleTime: Time = {
  type: TimeTypes.S,
  time: 5
}

export class ConfigRegister {
  ttl: Time;
  cicleTime: Time;
  observableKeys: Array<ObservableKey> = [];

  constructor(ttl: Time, observableKeys: Array<ObservableKey>, cicleTime?: Time) {
    this.ttl = ttl || defaultTTL;
    this.cicleTime = cicleTime || defaultCicleTime;
    this.observableKeys = observableKeys;
  }

  isValid() {
    return Object.values(TimeTypes).includes(this.ttl.type) && this.ttl.time > 0;
  }
}
