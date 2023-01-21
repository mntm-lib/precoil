import type { Atom, AtomUpdater, AtomValOrUpdater, Store } from './types.js';

import { default as mitt } from 'mitt';
import { batch } from './batch.js';

// Unique id
let unique = 0;
const id = () => `${++unique}`;

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
 *   updater.on(counterAtom.key, console.log);
 *
 * @example
 *
 *   // Logs state on update atom with `counter` key.
 *   updater.on('counter', console.log);
 *
 * @see https://github.com/developit/mitt
 */
export const updater = mitt<Record<string, any>>();

/**
 * The source of truth for all created atoms.
 *
 * @description It is better to use the atom's method to get the current state.
 *
 * @example
 *
 *   console.log(store.get('counter')); // log: 0
 *
 */
export const store: Store = new Map();

/**
 * An atom represents state in precoil.
 *
 * @description Atoms contain the source of truth for our application state.
 *
 * @template T Atom state type.
 *
 * @param defaultValue Initial atom state.
 *
 * @param key A unique string that allows you to identify the atom.
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
export const atom = <T>(defaultValue: T, key = id()): Atom<T> => {
  store.set(key, defaultValue);

  const _get = () => store.get(key) as T;

  const _set = (value: AtomValOrUpdater<T>) => {
    const current = store.get(key) as T;
    const next = typeof value === 'function' ? (value as AtomUpdater<T>)(current) : value;

    if (current !== next) {
      store.set(key, next);

      // Sync update
      batch(() => {
        updater.emit(key, next);
      });
    }

    return next;
  };

  const _sub = (next: (value: T) => void) => {
    updater.on(key, next);

    return () => updater.off(key, next);
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
 * @param key A unique string that allows you to identify the atom.
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
export const dynamicAtom = <T>(
  get: (
    get: <V>(atom: Atom<V>) => V
  ) => T,
  set: (
    get: <V>(atom: Atom<V>) => V,
    set: <V>(atom: Atom<V>, value: AtomValOrUpdater<V>) => V,
    arg: T
  ) => T,
  key = id()
): Atom<T> => {
  const depend: string[] = [];

  const defaultValue = get((from) => {
    const _key = from.key;

    if (depend.includes(_key)) {
      depend.push(_key);
    }

    return from.get();
  });

  const _get = () => get((from) => from.get());

  const _set = (arg: AtomValOrUpdater<T>) => {
    const next = set(
      (from) => from.get(),
      (from, value) => from.set(value),
      typeof arg === 'function' ? (arg as AtomUpdater<T>)(store.get(key) as T) : arg
    );

    store.set(key, next);

    return next;
  };

  const _sub = (next: (value: T) => void) => {
    const handle = (value: T) => next(_set(value));

    depend.some((_key) => updater.on(_key, handle));

    return () => depend.some((_key) => updater.off(_key, handle));
  };

  return {
    key,
    def: defaultValue,
    get: _get,
    set: _set,
    sub: _sub
  };
};
