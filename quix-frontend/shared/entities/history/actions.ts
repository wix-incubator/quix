import { IHistory } from "./types";
import { ExtractActionTypes, ExtractActions } from "../common/actions";

export const HistoryActions = {
  createNewHistory: (id: string, History: IHistory) => ({
    type: "history.create" as const,
    newHistory: History,
    id
  }),
  // TODO: Remove?
  updateHistory: (
    id: string,
    email: string,
    query: string[],
    moduleType: string,
    startedAt: string
  ) => ({
    id,
    email,
    query,
    moduleType,
    startedAt,
    type: "history.update" as const
  })
};

export type HistoryActions = ExtractActions<typeof HistoryActions>;
export type HistoryActionTypes = ExtractActionTypes<typeof HistoryActions>;
export const HistoryActionTypes = ExtractActionTypes(HistoryActions);
