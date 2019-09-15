import template from './files-sidebar.html';
import './files-sidebar.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {FileActions, NotebookActions, IFile} from '@wix/quix-shared';
import {IScope} from './files-sidebar-types';
import {cache} from '../../store';
import {
  addNotebook,
  addFolder,
  deleteFolder,
  isRoot,
  getFolderPermissions,
  StateManager,
  goToFile
} from '../../services';
import { goToNotebook } from '../../services/notebook';

enum States {
  Initial,
  Error,
  Result,
  Content
}

const listenToEvents = (scope, app: App, store: Store, fileExplorer) => {
  fileExplorer
    .on('fileCreated', ({id, path}) => {
      addNotebook(store, app, path, {addNote: true}, {id})
        .then(notebook => goToNotebook(app, notebook, {isNew: true}));
      }, false, scope)
    .on('fileMoved', ({id, path}) => store.dispatchAndLog(NotebookActions.moveNotebook(id, path)), false, scope)
    .on('folderDeleted', (folder) => deleteFolder(store, app, folder), false, scope)
    .on('folderCreated', ({id, path}) => addFolder(store, app, path, {id}), false, scope)
    .on('folderRenamed', ({id, name}) => store.dispatchAndLog(FileActions.updateName(id, name)), false, scope)
    .on('folderMoved', ({id, path}) => store.dispatchAndLog(FileActions.moveFile(id, path)), false, scope);
}

const listenToNavChange = (scope: IScope, app: App, fileExplorer) => {
  app.getNavigator()
    .listen(['files', 'notebook'], 'success', ({id}: {id: string}) => {
      const file = scope.vm.state.value().files.find(f => f.id === id);

     return file ? fileExplorer.setActive(file) : fileExplorer.clearActive();
    }, scope)
    .otherwise(() => fileExplorer.clearActive());
}

export default (app: App, store: Store) => () => ({
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
          onFileClick(file) {
            goToFile(app, file);
          }, 
          onFolderClick(folder) {
            goToFile(app, folder);
          }, 
          onNotebookAdd() {
            addNotebook(store, app, [], {addNote: true})
              .then(notebook => goToNotebook(app, notebook, {isNew: true}));
          }
        });

      scope.getFolderPermissions = (folder: IFile) => {
        const isRootFolder = isRoot(folder);
        const owner = scope.vm.state.value().files[0].owner;
        const permissions = getFolderPermissions(app, {...folder, owner});

        return {
          ...getFolderPermissions(app, folder),
          delete: permissions.delete && !isRootFolder,
          rename: permissions.rename && !isRootFolder
        };
      }

      cache.files.get();
      store.subscribe('files.files', (files: IFile[]) => {
        scope.vm.state
          .force('Result', !!files, {files})
          .set('Content', () => files.length > 1, () => ({files, tree: files}));
      }, scope);

      store.subscribe('files.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
