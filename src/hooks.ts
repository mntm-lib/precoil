import type { Atom, Selector } from './types.js';

import { useState } from 'react';
import { constDeps, useCreation, useHandler, useIsomorphicEffect } from '@mntm/shared';

/**
 * @description This is the recommended hook to use when a component intends to read computed state.
 * Using this hook in a React component will subscribe the component to re-render when the computed
 * state is updated.
 *
 * @returns The computed value of the given atom state.
 *
 * @example
 *
 *   // Somewhere outside the component, for example, next to the declaration of the atom:
 *   const selectPlus = (value) => value + 1;
 *
 *   // In the component:
 *   const plus = useAtomSelector(counterAtom, selectPlus);
 *
 * @noinline
 */
export const useAtomSelector = /*#__NOINLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>) => {
  const [state, handleState] = useState(() => selector(atom.get()));

  // Use layout effect for preventing race condition
  useIsomorphicEffect(() => atom.sub((value) => handleState(selector(value))), [selector]);

  return state;
};

/**
 * @description This is the recommended hook to use when a component intends to read state
 * without writing to it. Using this hook in a React component will subscribe the component
 * to re-render when the state is updated.
 *
 * @returns The value of the given atom state.
 *
 * @example
 *
 *   const counter = useAtomValue(counterAtom);
 *
 * @noinline
 */
export const useAtomValue = /*#__NOINLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  const [state, handleState] = useState(atom.get);

  // Use layout effect for preventing race condition
  useIsomorphicEffect(() => atom.sub(handleState), constDeps);

  return state;
};

/**
 * @description This is the recommended hook to use when a component intends to write to
 * state without reading it. Allows a component to set the value without subscribing the
 * component to re-render when the value changes.
 *
 * @returns A setter function for updating the value of atom state.
 *
 * @example
 *
 *   const setCounter = useSetAtomState(counterAtom);
 *
 * @nosideeffects
 */
export const useSetAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return useHandler(atom.set);
};

/**
 * @description This is the recommended hook to use when a component intends to read and
 * write state. Using this hook in a React component will subscribe the component
 * to re-render when the state is updated.
 *
 * @returns A tuple where the first element is the value of state and the second element
 * is a setter function that will update the value of the given state when called.
 *
 * @example
 *
 *   const [counter, setCounter] = useAtomState(counterAtom);
 *
 * @nosideeffects
 */
export const useAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  const state = useAtomValue(atom);
  const update = useSetAtomState(atom);

  return [state, update] as const;
};

/**
 * @description Using this hook allows a component to reset the state to its default value without
 * subscribing the component to re-render whenever the state changes.
 *
 * @returns A function that will reset the value of the given state to its default value.
 *
 * @example
 *
 *   const resetCounter = useResetAtomState(counterAtom);
 *
 * @nosideeffects
 */
export const useResetAtomState = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return useHandler(() => atom.set(atom.def));
};

/**
 * @description This is the recommended hook to use when a component intends to read computed state
 * only on first render. Using this hook in a React component will **NOT** subscribe the component
 * to re-render when the state is updated.
 *
 * @returns The value of the given atom state.
 *
 * @example
 *
 *   const counter = useAtomConst(counterAtom);
 *
 * @nosideeffects
 */
export const useAtomConst = /*#__INLINE__*/<T>(atom: Readonly<Atom<T>>) => {
  return useCreation(atom.get);
};

/**
 * @description This is the recommended hook to use when a component intends to read state
 * only on first render. Using this hook in a React component will **NOT** subscribe the component
 * to re-render when the state is updated.
 *
 * @returns The computed value of the given atom state.
 *
 * @example
 *
 *   const plus = useAtomSelectorConst(counterAtom, (value) => value + 1);
 *
 * @nosideeffects
 */
export const useAtomSelectorConst = /*#__INLINE__*/<T, S>(atom: Readonly<Atom<T>>, selector: Selector<T, S>) => {
  return useCreation(() => selector(atom.get()));
};
