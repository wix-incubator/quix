import { IReactComponentConfig } from '../../lib/app/services/plugin-builder';
import FileExplorer from './FileExplorerComponent';

export default (): IReactComponentConfig => ({
  name: 'File Explorer',
  template: FileExplorer,
  scope: ['tree', 'transformNode', 'fetchChildren', 'moreOptions', 'expanded'],
});
