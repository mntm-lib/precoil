import * as ReactDOM from 'react-dom';

export const batch = ReactDOM.unstable_batchedUpdates || ((callback: () => void) => callback());
