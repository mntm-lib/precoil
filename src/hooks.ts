import type { Atom, Selector } from './types.js';

import { useEffect, useState } from 'react';
import { useCreation, useMount } from '@mntm/shared';

import { updater } from './store.js';

/** @noinline */
export const useAtomSelector = /*#__NOINLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>): S => {
  const compute = () => selector(atom.get());
  const [state, setState] = useState(compute);

  useEffect(() => {
    const update = () => setState(compute());

    updater.on(atom.key, update);
    return () => updater.off(atom.key, update);
  }, [selector]);

  return state;
};

/** @nosideeffects */
export const useAtomValue = /*#__NOINLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  const [state, setState] = useState(atom.get);

  useMount(() => {
    const update = () => setState(atom.get());

    updater.on(atom.key, update);
    return () => updater.off(atom.key, update);
  });

  return state;
};

/** @nosideeffects */
export const useAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  const state = useAtomValue(atom);
  return [state, atom.set] as const;
};

/** @nosideeffects */
export const useSetAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return atom.set;
};

/** @nosideeffects */
export const useAtomConst = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>): T => {
  return useCreation(atom.get);
};

/** @nosideeffects */
export const useAtomSelectorConst = /*#__INLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>): S => {
  return useCreation(() => selector(atom.get()));
};
