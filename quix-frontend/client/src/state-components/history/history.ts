import { Store } from "../../lib/store";
import { App } from "../../lib/app";
import { IReactStateComponentConfig } from "../../lib/app/services/plugin-builder";
import { History, HistoryProps } from "./HistoryComponent";
import { cache } from "../../store";
import { onHistoryClick } from "./history-events";

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: "history",
  template: History,
  url: {},
  scope: {
    history: () => {},
    error: () => {},
    onHistoryClicked: () => {}
  },
  controller: async (scope: HistoryProps, params, { syncUrl, setTitle }) => {
    await cache.History.fetch(params.id);

    syncUrl();
    setTitle();

    store.subscribe(
      "History",
      ({ history, error }) => {
        scope.history = history;
        scope.error = error;
      },
      scope
    );

    scope.onHistoryClicked = onHistoryClick(scope, store, app);
  }
});
