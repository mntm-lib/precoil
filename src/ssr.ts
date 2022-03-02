import type { Atom } from './types.js';

import { store } from './store.js';

export const hydrateAtom = <T>(atom: Readonly<Atom<T>>, value: Readonly<T>) => {
  store.set(atom.key, value);
};

export const resetAtoms = (atoms: Readonly<Array<Readonly<Atom<any>>>>) => {
  atoms.forEach((atom) => store.set(atom.key, atom.def));
};
