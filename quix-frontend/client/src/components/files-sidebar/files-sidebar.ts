import template from './files-sidebar.html';
import './files-sidebar.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {FileActions, NotebookActions, IFile} from '../../../../shared';
import {IScope} from './files-sidebar-types';
import {cache} from '../../store';
import {addNotebook, addFolder} from '../../services';
import {findFileById} from '../../services/files';
import {StateManager} from '../../services/state';

enum States {
  Initial,
  Error,
  Result,
  Content
}

const listenToEvents = (scope, app: Instance, store: Store, fileExplorer) => {
  fileExplorer
    .on('fileCreated', ({id, path}) => addNotebook(store, app, path, {id}), false, scope)
    .on('fileMoved', ({id, path}) => store.dispatch(NotebookActions.moveNotebook(id, path)), false, scope)
    .on('folderDeleted', ({id}) => store.dispatchAndLog(FileActions.deleteFile(id)), false, scope)
    .on('folderCreated', ({id, path}) => addFolder(store, app, path, {id}), false, scope)
    .on('folderRenamed', ({id, name}) => store.dispatchAndLog(FileActions.updateName(id, name)), false, scope)
    .on('folderMoved', ({id, path}) => store.dispatchAndLog(FileActions.moveFile(id, path)), false, scope);
}

const listenToNavChange = (scope: IScope, app: Instance, fileExplorer) => {
  app.getNavigator()
  .listen(['base.notebook'], 'success', ({id}: {id: string}) => {
    const file = findFileById(scope.vm.state.value().files, id);
    return file && fileExplorer.setActive(file);
  }, scope)
  .otherwise(() => fileExplorer.clearActive());
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          $init() {
            this.state = new StateManager(States);
          }
        })
        .withEvents({
          onFileExplorerLoad(fileExplorer) {
            listenToEvents(scope, app, store, fileExplorer);
            listenToNavChange(scope, app, fileExplorer);
          },
          onFileClick({id}) {
            app.getNavigator().go('base.notebook', {id, isNew: false});
          }, 
          onSidebarClose() {

          },
          onNotebookAdd() {
            addNotebook(store, app);
          },
        });

      cache.files.get();
      store.subscribe('files.files', (files: IFile[]) => {
        scope.vm.state
          .force('Result', !!files, {files})
          .set('Content', () => !!files.length, () => ({files}));
      }, scope);

      store.subscribe('files.view.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
