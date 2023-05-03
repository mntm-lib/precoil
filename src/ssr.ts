import type { Atom } from './types.js';

import { unsafe_store } from './store.js';

/**
 * Sets the state of the passed atom.
 */
export const hydrateAtom = <T>(atom: Atom<T>, value: T) => {
  unsafe_store.set(atom.key, value);
};

/**
 * Resets a state of passed atom.
 */
export const resetAtom = <T>(atom: Atom<T>) => {
  unsafe_store.set(atom.key, atom.def);
};

/**
 * Resets states of passed atoms.
 */
export const resetAtoms = (atoms: ReadonlyArray<Atom<any>>) => {
  atoms.some(resetAtom);
};
