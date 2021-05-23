import { ConfigRegister } from "../model/config-register";

export interface CacheControlRegister {
  register: (config: ConfigRegister) => void;
}