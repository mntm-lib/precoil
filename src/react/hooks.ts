import type { Atom, Selector } from '../types.js';

import { useEffect, useRef, useState } from 'react';
import { useUpdate, useMount, useCreation, isShallowEqual } from '@mntm/shared';

import { broadcast } from './shared.js';
import { select } from '../store.js';

export const usePrecoilSubscribe = (key: string) => {
  const next = useUpdate();
  useMount(() => {
    broadcast.on(key, next);
    return () => broadcast.off(key, next);
  });
};

export const usePrecoilState = <T>(atom: Atom<T>) => {
  usePrecoilSubscribe(atom.key);
  return [atom.get(), atom.set] as const;
};

export const usePrecoilValue = <T>(atom: Atom<T>): T => {
  usePrecoilSubscribe(atom.key);
  return atom.get();
};

export const useSetPrecoilState = <T>(atom: Atom<T>) => {
  return atom.set;
};

export const usePrecoilConst = <T>(atom: Atom<T>): T => {
  return useRef(atom.get()).current;
};

export const usePrecoilSelector = <T, S>(atom: Atom<T>, selector: Selector<T, S>): S => {
  const compute = () => select(atom, selector);
  const [state, setState] = useState(compute);
  const last = useRef(state);

  useEffect(() => {
    const update = () => {
      const next = compute();
      if (
        next !== last.current &&
        isShallowEqual(next, last.current)
      ) {
        return;
      }
      last.current = next;
      setState(next);
    };

    broadcast.on(atom.key, update);
    return () => broadcast.off(atom.key, update);
  }, [selector]);

  return state;
};

export const usePrecoilSelectorConst = <T, S>(atom: Atom<T>, selector: Selector<T, S>): S => {
  return useCreation(() => select(atom, selector));
};
