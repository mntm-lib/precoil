import type { Atom, AtomSelector } from './types.js';

import * as React from 'react';

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
export const useAtomSelector = <T, S>(atom: Atom<T>, selector: AtomSelector<T, S>) => {
  const reselect = React.useRef(() => selector(atom.get())).current;

  return React.useSyncExternalStore(
    atom.sub,
    reselect,
    reselect
  );
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
 * @nosideeffects
 */
export const useAtomValue = <T>(atom: Atom<T>) => {
  return React.useSyncExternalStore(
    atom.sub,
    atom.get,
    atom.get
  );
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
export const useSetAtomState = <T>(atom: Atom<T>) => {
  return React.useRef(atom.set).current;
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
export const useAtomState = <T>(atom: Atom<T>) => {
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
export const useResetAtomState = <T>(atom: Atom<T>) => {
  return React.useRef(() => atom.set(atom.def)).current;
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
export const useAtomConst = <T>(atom: Atom<T>) => {
  return React.useMemo(atom.get, []);
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
export const useAtomSelectorConst = <T, S>(atom: Atom<T>, selector: AtomSelector<T, S>) => {
  return React.useMemo(() => selector(atom.get()), []);
};
