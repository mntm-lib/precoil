export type Store = Map<string, unknown>;

export type AtomUpdater<T> = (state: T) => T;
export type AtomValOrUpdater<T> = T | AtomUpdater<T>;

export type Selector<T, S> = (partial: T) => S;

export type Atom<T> = {
  key: string;
  default: T;
  get: () => T;
  set: (value: AtomValOrUpdater<T>) => T;
};
