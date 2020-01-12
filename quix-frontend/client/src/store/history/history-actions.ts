import { IHistory } from '@wix/quix-shared';

export const setHistory = (history: IHistory[]) => ({
  type: 'history.set',
  history
});

export const setError = (error: any) => ({
  type: 'history.setError',
  error
});
