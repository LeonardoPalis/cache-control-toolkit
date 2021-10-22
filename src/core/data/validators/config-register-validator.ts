
import { IConfigRegister } from "../contracts/config-register";
import { TimeTypes } from "../../domain/entities/time";
import { IValidator } from "../contracts/validator";

export class ConfigRegisterValidator implements IValidator {
  
  private constructor(private readonly configRegister: IConfigRegister) { }

  static useConfig(config: IConfigRegister) {
    return new ConfigRegisterValidator(config);
  }

  isValid() {
    return Object.values(TimeTypes)
      .includes(this.configRegister.ttl.type) && this.configRegister.ttl.time >= 0;
  }
}
