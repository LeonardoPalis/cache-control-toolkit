export interface SetStorage<T> {
  save: (key: string, value: T) => void;
}