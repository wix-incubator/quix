import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactStateComponentConfig } from '../../lib/app/services/plugin-builder';
import { FileExplorer, FileExplorerProps } from './FileExplorerComponent';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'File Explorer',
  template: FileExplorer,
  url: {},
  scope: {
    error: () => {},
  },
  controller: async (scope: FileExplorerProps, params, { syncUrl, setTitle }) => {
    syncUrl();
    setTitle();

    store.subscribe(
      'fileExplorer',
      ({ error }) => {

      },
      scope
    );
  }
});
