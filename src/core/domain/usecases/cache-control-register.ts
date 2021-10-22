import { IConfigRegister } from "../../data/models/config-register";
export interface CacheControlRegister {
  register: (config: IConfigRegister) => void;
}