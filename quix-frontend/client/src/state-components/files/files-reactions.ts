import {IScope} from './files-types';
import {initTableFields} from './files-table-fields';
import {IFolder, IFile} from '@wix/quix-shared';

export function setFolder(scope: IScope, folder: IFolder) {
  scope.vm.state
    .set('Result', !!folder, {folder})
    .then(() => {
      scope.vm.breadcrumbs = [...folder.path, {id: folder.id, name: folder.name}];

      if (!scope.permissions.edit) {
        scope.vm.breadcrumbs[0].name = `${folder.ownerDetails.name}'s notebooks`;
      }
    })
    .else(() => scope.vm.state.value({folder}));
}

export function setFiles(scope: IScope, files: IFile[]) {
  scope.vm.state
    .force('Result', !!files, {files})
    .set('Content', () => !!files.length, {files})
    .then(() => scope.vm.fields = initTableFields(scope));
}

export function setError(scope: IScope, error: any) {
  scope.vm.state.force('Error', !!error, {error});
}

export function setMarkedMap(scope: IScope, markedMap: Record<string, IFile>) {
  scope.vm.marked.map = markedMap;
}

export function setMarkedList(scope: IScope, markedList: IFile[]) {
  scope.vm.marked.list = markedList;
  scope.vm.marked.toggle(!!markedList.length);
}
