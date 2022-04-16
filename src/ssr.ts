import type { Atom } from './types.js';

import { store } from './store.js';

/**
 * Sets the state of the passed atom.
 */
export const hydrateAtom = <T>(atom: Readonly<Atom<T>>, value: Readonly<T>) => {
  store.set(atom.key, value);
};

/**
 * Resets a state of passed atom.
 */
export const resetAtom = <T>(atom: Readonly<Atom<T>>) => {
  store.set(atom.key, atom.def);
};

/**
 * Resets states of passed atoms.
 */
export const resetAtoms = (atoms: ReadonlyArray<Readonly<Atom<any>>>) => {
  atoms.forEach(resetAtom);
};
