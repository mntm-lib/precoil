import type { FC } from 'react';

import { batch, castRender, useMount } from '@mntm/shared';
import { updater } from '../store.js';
import { broadcast } from './shared.js';

export const PrecoilRoot: FC = ({ children }) => {
  useMount(() => {
    const batcher = (type = '*') => {
      batch(() => {
        broadcast.emit(type);
      });
    };

    updater.on('*', batcher);
    return () => updater.off('*', batcher);
  });

  return castRender(children);
};
