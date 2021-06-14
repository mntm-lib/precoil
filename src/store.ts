import type { Store, Atom, AtomValOrUpdater, Selector } from './types.js';

import { mitt, batch, weakUniqueId, isFunction } from '@mntm/shared';

export const updater = mitt();

export const store: Store = new Map();

export const getter = <T>(key: string): T => {
  return store.get(key) as T;
};

export const setter = <T>(key: string, value: AtomValOrUpdater<T>): T => {
  const next = isFunction(value) ? value(getter(key)) : value;
  const has = store.has(key);

  if (!has || store.get(key) !== next) {
    store.set(key, next);

    if (has) {
      // sync
      batch(() => {
        updater.emit(key, next);
      });
    }
  }

  return next;
};

export const atom = <T>(defaultValue: T, key = weakUniqueId()): Atom<T> => {
  store.set(key, defaultValue);

  return {
    key,
    default: defaultValue,
    get() {
      return getter(key);
    },
    set(value: AtomValOrUpdater<T>) {
      return setter(key, value);
    }
  };
};

export const select = <T, S>(atom: Atom<T>, selector: Selector<T, S>): S => {
  return selector(atom.get());
};
