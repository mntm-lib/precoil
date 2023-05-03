import type {
  Atom,
  AtomKey,
  AtomStore,
  AtomStoreUpdate,
  AtomUpdater,
  AtomValueUpdate,
  DynamicAtomGetter,
  DynamicAtomSetter
} from './types.js';

import { default as mitt } from 'mitt';
import { batch } from './batch.js';

// Unique id
let _id = 0;
const id = () => Symbol(_id++);

/**
 * Special EventEmitter for state updates.
 *
 * @description Precoil is built around an idiomatic asynchronous event-driven
 * architecture in which setters emits atoms keys named events that cause
 * listeners to be called with a new state.
 *
 * @example
 *
 *   // Logs state on update atom.
 *   unsafe_updater.on(counterAtom.key, console.log);
 *
 * @example
 *
 *   // Logs state on update atom with `counter` key.
 *   unsafe_updater.on('counter', console.log);
 *
 * @see https://github.com/developit/mitt
 *
 * @nosideeffects
 */
export const unsafe_updater = /*@__PURE__*/mitt<AtomStoreUpdate>();

/**
 * The source of truth for all created atoms.
 *
 * @description It is better to use the atom's method to get the current state.
 *
 * @example
 *
 *   console.log(store.get('counter')); // log: 0
 *
 * @nosideeffects
 */
export const unsafe_store: AtomStore = /*@__PURE__*/new Map();

/**
 * An atom represents state in precoil.
 *
 * @description Atoms contain the source of truth for our application state.
 *
 * @template T Atom state type.
 *
 * @param defaultValue Initial atom state.
 *
 * @param key A unique value that allows you to identify the atom.
 *
 * @returns A new atom that lets you read and update its state.
 *
 * @example
 *
 *   const counterAtom = atom(0, 'counter');
 *
 *   console.log(counterAtom.get()); // log: 0
 *   console.log(counterAtom.set(1)); // log: 1
 *
 * @noinline
 */
export const atom = <Value>(defaultValue: Value, key: AtomKey = id()): Atom<Value> => {
  unsafe_store.set(key, defaultValue);

  const _get = () => unsafe_store.get(key) as Value;

  const _set = (update: AtomValueUpdate<Value>) => {
    const current = unsafe_store.get(key) as Value;
    const next = typeof update === 'function' ? (update as AtomUpdater<Value>)(current) : update;

    if (
      (
        /* eslint-disable no-self-compare */
        current === current ||
        next === next
      ) &&
      current !== next
    ) {
      unsafe_store.set(key, next);

      // Sync update
      batch(() => unsafe_updater.emit(key, next));
    }

    return next;
  };

  const _sub = (next: (value: Value) => void) => {
    unsafe_updater.on(key, next);

    return () => unsafe_updater.off(key, next);
  };

  return {
    key,
    def: defaultValue,
    get: _get,
    set: _set,
    sub: _sub
  };
};

/**
 * An dynamic atom represents state in precoil.
 *
 * @description Dynamic atoms depend on other atoms.
 *
 * @template T Dynamic atom state type.
 *
 * @param get Function to get states of other atoms.
 *
 * @param set Function to set new states to other atoms.
 *
 * @param key A unique value that allows you to identify the atom.
 *
 * @returns A new dynamic atom that lets you read and update dependent
 * atoms state.
 *
 * @example
 *
 *   const dynamicCounterAtom = dynamicAtom(
 *     (get) => get(counterAtom),
 *     (get, set, arg) => set(counterAtom, arg),
 *     'dynamicCount'
 *   );
 *
 *   console.log(dynamicCounterAtom.get()); // log: 0
 *   console.log(dynamicCounterAtom.set(1)); // log: 1
 *
 * @noinline
 */
export const dynamicAtom = <Value, Update = undefined>(
  get: (
    get: DynamicAtomGetter
  ) => Value,
  set: (
    get: DynamicAtomGetter,
    set: DynamicAtomSetter,
    update: Update
  ) => Value,
  key: AtomKey = id()
): Atom<Value, Update> => {
  const _depend: AtomKey[] = [];

  const _get = () => get((from) => {
    const _key = from.key;

    if (_key === key) {
      return unsafe_store.get(_key);
    }

    if (!_depend.includes(_key)) {
      _depend.push(_key);
    }

    return from.get();
  });

  const _set = (update: AtomValueUpdate<Value, Update>) => set(
    (from) => from.get(),
    (from, _update) => from.set(_update),
    typeof update === 'function' ? (update as AtomUpdater<Value, Update>)(unsafe_store.get(key)) : update
  );

  const _dynamic = atom(_get(), key);
  const _update = _dynamic.set;

  _dynamic.set = (arg) => _update(_set(arg as any));

  _depend.some((_key) => unsafe_updater.on(_key, () => _update(_get())));

  return _dynamic as any;
};
