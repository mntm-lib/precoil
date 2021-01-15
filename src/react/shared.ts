import mitt from 'mitt';
export const broadcast = mitt();

export { unstable_batchedUpdates as batch } from 'react-dom';
