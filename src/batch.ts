import * as ReactDOM from 'react-dom';

export const batch = (ReactDOM as any)['unstable_batchedUpdates'.toString()] || ((callback: () => void) => callback());
