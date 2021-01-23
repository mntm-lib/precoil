import type { DependencyList } from 'react';

import mitt from 'mitt';
export const broadcast = mitt();

export { unstable_batchedUpdates as batch } from 'react-dom';

export const constRef = {};
export const constDependencyList: DependencyList = [];
