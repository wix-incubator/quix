import template from './destination-picker.html';
import './destination-picker.scss';

import {initNgScope, createNgModel} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IFile, FileType} from '@wix/quix-shared';
import {IScope} from './destination-picker-types';
import {cache} from '../../store';
import {StateManager, fetchRoot, fetchFile, fetchFileParent} from '../../services';

enum States {
  Initial,
  Error,
  Result,
  Content
}

const listenToNavChange = (scope: IScope, app: App, fileExplorer) => {
  app.getNavigator()
    .listen(['files', 'notebook'], 'success', async ({id}: {id: string}, state: string) => {
      let file = await fetchFile(id) || await fetchRoot();

      if (!file) {
        return;
      }

      if (scope.context === 'folder' && file.type === FileType.notebook) {
        file = await fetchFileParent(file.id);
      }

      if (file) {
        fileExplorer.setActive(file);
        scope.model = file;

        if (file.type === FileType.folder) {
          scope.events.onFolderClick(file);
        } else if (file.type === FileType.notebook) {
          scope.events.onFileClick(file);
        }
      }
    }, scope)
    .otherwise(() => fileExplorer.clearActive());
}

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  require: 'ngModel',
  scope: {
    context: '@'
  },
  link: {
    async pre(scope: IScope, element, attr, ngModel) {
      createNgModel(scope, ngModel);

      initNgScope(scope)
        .withVM({
          $init() {
            this.state = new StateManager(States);
          }
        })
        .withEvents({
          onFileExplorerLoad(fileExplorer) {
            listenToNavChange(scope, app, fileExplorer);
          },
          onFileClick(file) {
            scope.model = scope.context === 'notebook' ? file : null;
          }, 
          onFolderClick(folder) {
            scope.model = scope.context === 'folder' ? folder : null;
          }
        });

      cache.files.get();
      store.subscribe('files.files', (files: IFile[]) => {
        scope.vm.state
          .force('Result', !!files, {files})
          .set('Content', () => files.length > 0, () => ({
            tree: scope.context === 'folder' ? files.filter(file => file.type === FileType.folder) : files
          }));
      }, scope);

      store.subscribe('files.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
