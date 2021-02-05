import mitt from 'mitt';

import type { Store, Atom, AtomUpdater, AtomValOrUpdater, Selector } from './types';

export const updater = mitt();

export const store: Store = {};

export const isUpdater = <T>(func: AtomValOrUpdater<T>): func is AtomUpdater<T> => typeof func === 'function';

export const getter = <T>(key: string): T => {
  return store[key] as T;
};

export const setter = <T>(key: string, value: AtomValOrUpdater<T>): T => {
  const next = isUpdater(value) ? value(getter(key)) : value;
  const has = key in store;

  if (!has || store[key] !== next) {
    store[key] = next;

    if (has) {
      updater.emit(key, next);
    }
  }

  return next;
};

let id = 0;
const generateKey = () => (++id) + Math.floor(Math.random() * 1E6).toString(32);
export const atom = <T>(defaultValue: T, key = generateKey()): Atom<T> => {
  store[key] = defaultValue;

  return {
    key,
    default: defaultValue,
    get() {
      return getter(key);
    },
    set(value: T) {
      return setter(key, value);
    }
  };
};

export const select = <T, S>(atom: Atom<T>, selector: Selector<T, S>): S => {
  return selector(atom.get());
};
