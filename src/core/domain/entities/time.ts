export type Time = {
  type: TimeTypes;
  time: number;
};

export enum TimeTypes {
  MS = "miliseconds",
  S = "seconds",
  M = "minutes",
  H = "hours",
}

export function convertTimeToMiliseconds(time: Time) {
  if (time.type === TimeTypes.H) {
    return time.time * 3600000;
  }
  if (time.type === TimeTypes.M) {
    return time.time * 60000;
  }
  if (time.type === TimeTypes.S) {
    return time.time * 1000;
  }
  return time.time;
}
