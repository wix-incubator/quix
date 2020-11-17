import { IHistory } from './types';
import { ExtractActionTypes, ExtractActions } from '../common/actions';

export const HistoryActions = {
  createHistory: (id: string, history: IHistory) => ({
    type: 'history.create' as const,
    history,
    id
  }),
};

export type HistoryActions = ExtractActions<typeof HistoryActions>;
export type HistoryActionTypes = ExtractActionTypes<typeof HistoryActions>;
export const HistoryActionTypes = ExtractActionTypes(HistoryActions);
