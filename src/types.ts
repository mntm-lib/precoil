export type AtomKey = string | number | symbol;

export type AtomStore = Map<AtomKey, any>;
export type AtomStoreUpdate = Record<AtomKey, any>;

export type AtomUpdater<Value, Update = Value> = (value: Value) => Update;
export type AtomValueUpdate<Value, Update = Value> = Update | AtomUpdater<Value, Update>;

export type AtomSelector<Value, Selected> = (value: Value) => Selected;

export type AtomGetter<Value> = () => Value;
export type AtomSetter<Value, Update = Value> = (update: AtomValueUpdate<Value, Update>) => Value;

export type AtomSubscribe<Value> = (next: (value: Value) => void) => () => void;

export type Atom<Value, Update = Value> = {
  readonly key: AtomKey;
  readonly def: Value;

  get: AtomGetter<Value>;
  set: AtomSetter<Value, Update>;
  sub: AtomSubscribe<Value>;
};

export type DynamicAtomGetter = <Value, Update = Value>(
  atom: Atom<Value, Update>
) => Value;

export type DynamicAtomSetter = <Value, Update = Value>(
  atom: Atom<Value, Update>,
  update: AtomValueUpdate<Value, Update>
) => Value;
