import { IHistory } from "./types";
import { ExtractActionTypes, ExtractActions } from "../common/actions";

// TODO: Fix schema.
export const HistoryActions = {
  createNewHistory: (id: string, History: IHistory) => ({
    type: "history.create" as const,
    newHistory: History,
    id
  }),
  updateHistory: (id: string, avatar: string, name: string, email: string) => ({
    type: "history.update" as const,
    name,
    email,
    avatar,
    id
  })
};

export type HistoryActions = ExtractActions<typeof HistoryActions>;
export type HistoryActionTypes = ExtractActionTypes<typeof HistoryActions>;
export const HistoryActionTypes = ExtractActionTypes(HistoryActions);
