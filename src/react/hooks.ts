import type { Atom, Selector } from '../types';
import type { DependencyList } from 'react';

import { useReducer, useEffect, useRef, useState, useMemo } from 'react';
import { broadcast } from './shared';
import { select } from '../store';
import { shallowEqual } from '../utils';

const constRef = {};
const constDependencyList: DependencyList = [];

const subscribeReducer = () => ({});
export const usePrecoilSubscribe = (key: string) => {
  const [, next] = useReducer(subscribeReducer, constRef);
  useEffect(() => {
    broadcast.on(key, next);
    return () => broadcast.off(key, next);
  }, constDependencyList);
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
      if (shallowEqual(next, last.current)) {
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
  return useMemo(() => select(atom, selector), constDependencyList);
};
