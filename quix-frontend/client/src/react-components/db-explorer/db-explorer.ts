import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactStateComponentConfig } from '../../lib/app/services/plugin-builder';
import { DbExplorer, DbExplorerProps } from './DbExplorerComponent';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'DB Explorer',
  template: DbExplorer,
  url: {},
  scope: {
    error: () => {},
  },
  controller: async (scope: DbExplorerProps, params, { syncUrl, setTitle }) => {
    syncUrl();
    setTitle();

    store.subscribe(
      'dbExplorer',
      ({ error }) => {

      },
      scope
    );
  }
});
