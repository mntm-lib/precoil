import type { FC } from 'react';

import { useEffect } from 'react';
import { updater } from '../store';
import { batch, broadcast, constDependencyList } from './shared';

export const PrecoilRoot: FC = ({ children }) => {
  useEffect(() => {
    updater.on('*', (type) => {
      batch(() => {
        broadcast.emit(type);
      });
    });
  }, constDependencyList);

  return (
    <>
      {children}
    </>
  );
};
