import type { Atom, Selector } from './types.js';

import { useEffect, useState } from 'react';
import { useMount, useCreation } from '@mntm/shared';

import { updater, store } from './store.js';

/** @noinline */
export const useAtomSubscribe = /*#__NOINLINE__*/<T>(key: string): T => {
  const [value, setValue] = useState(store.get(key));
  useMount(() => {
    const next = () => setValue(store.get(key));
    updater.on(key, next);
    return () => updater.off(key, next);
  });
  return value as T;
};

/** @nosideeffects */
export const useAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return [useAtomSubscribe(atom.key), atom.set] as const;
};

/** @nosideeffects */
export const useAtomValue = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>): T => {
  return useAtomSubscribe(atom.key);
};

/** @nosideeffects */
export const useSetAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return atom.set;
};

/** @nosideeffects */
export const useAtomConst = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>): T => {
  return useCreation(atom.get);
};

/** @noinline */
export const useAtomSelector = /*#__NOINLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>): S => {
  const compute = () => selector(atom.get());
  const [state, setState] = useState(compute);

  useEffect(() => {
    const update = () => {
      setState(compute());
    };

    updater.on(atom.key, update);
    return () => updater.off(atom.key, update);
  }, [selector]);

  return state;
};

/** @nosideeffects */
export const useAtomSelectorConst = /*#__INLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>): S => {
  return useCreation(() => selector(atom.get()));
};
