import { Time } from "./time";
import { Unregister } from "./unregister";

export type ObservableKey = {
  key: string;
  ttl: Time;
  callback?: () => void;
  unregister: Unregister;
}