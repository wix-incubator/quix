import template from './destination-picker.html';
import './destination-picker.scss';

import {last} from 'lodash';
import {initNgScope, createNgModel} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IFile, FileType} from '../../../../shared';
import {IScope} from './destination-picker-types';
import {cache} from '../../store';
import {
  StateManager
} from '../../services';

enum States {
  Initial,
  Error,
  Result,
  Content
}

const listenToNavChange = (scope: IScope, app: Instance, fileExplorer) => {
  app.getNavigator()
  .listen(['base.files', 'base.notebook'], 'success', ({id}: {id: string}) => {
    const files = scope.vm.state.value().files;
    let file = files.find(f => f.id === id);
    
    if (file && file.type === FileType.notebook) {
      id = last<any>(file.path).id;
      file = files.find(f => f.id === id);
    }

   if (file) {
     fileExplorer.setActive(file);
     scope.model = file;
   }
  }, scope)
  .otherwise(() => fileExplorer.clearActive());
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  require: 'ngModel',
  scope: {},
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
            scope.model = file;
          }, 
          onFolderClick(folder) {
            scope.model = folder;
          }
        });

      cache.files.get();
      store.subscribe('files.files', (files: IFile[]) => {
        scope.vm.state
          .force('Result', !!files, {files})
          .set('Content', () => files.length > 1, () => ({tree: files.filter(file => file.type === FileType.folder)}));
      }, scope);

      store.subscribe('files.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
