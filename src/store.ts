import type { Atom, AtomValOrUpdater, Store } from './types.js';

import { batch, isFunction, weakUniqueId } from '@mntm/shared';
import { default as mitt } from 'mitt';

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
 * Utility function for creating getters.
 *
 * @template T Atom state type.
 *
 * @param key Atom's key.
 *
 * @returns A new getter for the current state of the atom.
 *
 * @example
 *
 *   const getCounter = getter(counterAtom.key);
 *
 *   console.log(getCounter()); // log: 0
 *
 * @noinline
 */
export const getter = <T>(key: string) => () => store.get(key) as T;

/**
 * Utility function for creating setters.
 *
 * @template T Atom state type.
 *
 * @param key Atom's key.
 *
 * @returns A new setter for the current state of the atom.
 *
 * @example
 *
 *   const setCounter = setter(counterAtom.key);
 *
 *   console.log(setCounter(2)); // log: 2
 *
 * @noinline
 */
export const setter = <T>(key: string) => (value: AtomValOrUpdater<T>): T => {
  const current = store.get(key) as T;
  const next = isFunction(value) ? value(current) : value;

  if (current !== next) {
    store.set(key, next);

    // Sync update
    batch(() => {
      updater.emit(key, next);
    });
  }

  return next;
};

/**
 * An atom represents state in precoil.
 *
 * @description Atoms contain the source of truth for our application state.
 *
 * @template T Atom state type.
 *
 * @param defaultValue Initial atom state.
 *
 * @param key A unique string that allows you to indetify the atom.
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
export const atom = <T>(defaultValue: T, key = weakUniqueId()): Atom<T> => {
  store.set(key, defaultValue);

  return {
    key,
    default: defaultValue,
    get: getter(key),
    set: setter(key)
  };
};
