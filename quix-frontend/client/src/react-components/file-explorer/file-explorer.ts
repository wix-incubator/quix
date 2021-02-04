import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactComponentConfig } from '../../lib/app/services/plugin-builder';
import FileExplorer from './FileExplorerComponent';

export default (app: App, store: Store): IReactComponentConfig => ({
  name: 'File Explorer',
  template: FileExplorer,
  scope: {
    fooBar: () => {},
  },
});
