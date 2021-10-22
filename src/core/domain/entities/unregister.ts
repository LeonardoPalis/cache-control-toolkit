export type Unregister = {
  mode: UnregisterMode,
  callback?: Function,
} 

export enum UnregisterMode {
  deleteOnTime = "deleteOnTime",
  waitToCloseSite = "waitToCloseSite",
}