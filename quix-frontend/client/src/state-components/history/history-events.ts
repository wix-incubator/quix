import { Store } from "../../lib/store";
import { App } from "../../lib/app";
import { IHistory } from "@wix/quix-shared";

export const onHistoryClick = (scope, store: Store, app: App) => (
  history: IHistory
) => {
  app.go("files", { id: history.rootFolder });
};
