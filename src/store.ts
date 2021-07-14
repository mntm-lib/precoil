import type { Store, Atom, AtomValOrUpdater } from './types.js';

import { mitt, batch, weakUniqueId, isFunction } from '@mntm/shared';

export const updater = mitt();

export const store: Store = new Map();

export const getter = <T>(key: string) => () => store.get(key) as T;

export const setter = <T>(key: string) => (value: AtomValOrUpdater<T>): T => {
  const current = store.get(key) as T;
  const next = isFunction(value) ? value(current) : value;

  if (current !== next) {
    store.set(key, next);

    // sync
    batch(() => {
      updater.emit(key, next);
    });
  }

  return next;
};

export const atom = <T>(defaultValue: T, key = weakUniqueId()): Atom<T> => {
  store.set(key, defaultValue);

  return {
    key,
    default: defaultValue,
    get: getter(key),
    set: setter(key)
  };
};
