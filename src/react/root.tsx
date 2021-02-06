import type { FC } from 'react';

import { batch, castRender, useMount } from '@mntm/shared';
import { updater } from '../store';
import { broadcast } from './shared';

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
