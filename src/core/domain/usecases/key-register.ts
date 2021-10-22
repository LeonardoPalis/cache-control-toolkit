import { RegisteredKey } from "../model/registered-key";
import { ObservableKey } from "../types/observable-key";

export interface KeyRegister {
  execute: (key: ObservableKey, callback?: () => void) => RegisteredKey;
}