import type { Atom, Selector } from './types.js';

import { useLayoutEffect, useState } from 'react';
import { constDeps, useCreation, useHandler } from '@mntm/shared';

import { updater } from './store.js';

/** @noinline */
export const useAtomSelector = /*#__NOINLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>) => {
  const [state, handleState] = useState(() => selector(atom.get()));

  // Use layout effect for preventing race condition
  useLayoutEffect(() => {
    const handleSelect = (value: T) => handleState(selector(value));

    updater.on(atom.key, handleSelect);

    return () => updater.off(atom.key, handleSelect);
  }, [selector]);

  return state;
};

/** @nosideeffects */
export const useAtomValue = /*#__NOINLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  const [state, handleState] = useState(atom.get);

  // Use layout effect for preventing race condition
  useLayoutEffect(() => {
    updater.on(atom.key, handleState);

    return () => updater.off(atom.key, handleState);
  }, constDeps);

  return state;
};

/** @nosideeffects */
export const useSetAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return useHandler(atom.set);
};

/** @nosideeffects */
export const useAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  const state = useAtomValue(atom);
  const update = useSetAtomState(atom);

  return [state, update] as const;
};

/** @nosideeffects */
export const useResetAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return useHandler(() => atom.set(atom.default));
};

/** @nosideeffects */
export const useAtomConst = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return useCreation(atom.get);
};

/** @nosideeffects */
export const useAtomSelectorConst = /*#__INLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>) => {
  return useCreation(() => selector(atom.get()));
};
