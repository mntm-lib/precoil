export type Store = Map<string, unknown>;

export type AtomUpdater<T> = (state: T) => T;
export type AtomValOrUpdater<T> = T | AtomUpdater<T>;

export type Selector<T, S> = (partial: T) => S;

export type AtomGetter<T> = () => T;
export type AtomSetter<T> = (value: AtomValOrUpdater<T>) => T;
export type AtomSubscribe<T> = (set: (value: T) => void) => () => void;

export type Atom<T> = {
  key: string;
  def: T;
  get: AtomGetter<T>;
  set: AtomSetter<T>;
  sub: AtomSubscribe<T>;
};
