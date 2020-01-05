import uuid from "uuid/v4";
import { IHistory } from "./types";

// TODO: Make sure schema is correct
export const createHistory = (props: Partial<IHistory> = {}): IHistory => ({
  id: uuid(),
  name: "Local History",
  email: "local@quix.com",
  avatar: "",
  rootFolder: "",
  dateCreated: 0,
  dateUpdated: 0,
  ...props
});

export const createEmptyIHistory = (historyId: string = ""): IHistory => ({
  id: historyId,
  name: "",
  email: historyId,
  avatar: "",
  rootFolder: "",
  dateCreated: 0,
  dateUpdated: 0
});
