import { ObservableKey } from "../../domain/types/observable-key";
import { Time } from "../../domain/types/time";

export interface IConfigRegister {
  ttl: Time;
  cicleTime: Time;
  observableKeys: Array<ObservableKey>;
}