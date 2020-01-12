import uuid from 'uuid/v4';
import { IHistory } from './types';

export const createHistory = (props: Partial<IHistory> = {}): IHistory => ({
  id: uuid(),
  email: 'local@quix.com',
  query: [],
  moduleType: 'presto',
  startedAt: '',
  ...props
});
