import { Time } from "../types/time";
import { Unregister } from "../types/unregister";

export interface RegisteredKey {
  tag: string;
  registeredAt: Date;
  expiresAt: Date;
  unregistered: Unregister;
  ttl: Time;
  ref: string;
}