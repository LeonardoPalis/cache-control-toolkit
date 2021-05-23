export interface ClearStorage {
  cleanByKey: (key: string) => void;
  cleanAll: () => void;
}