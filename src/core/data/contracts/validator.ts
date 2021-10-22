import { IConfigRegister } from "./config-register";

export interface IValidator {
  isValid(config: IConfigRegister): boolean;
}