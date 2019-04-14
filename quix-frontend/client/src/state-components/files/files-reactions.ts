import {IScope} from './files-types';
import {initTableFields} from './files-table-fields';
import {IFile} from '../../../../shared';

export function setFile(scope: IScope, file: IFile) {
  scope.vm.state
    .set('Result', !!file, {file})
    .then(() => {
      if (file.id && scope.vm.breadcrumbs.length === 1) {
        scope.vm.breadcrumbs = [{
          name: scope.permissions.edit ? 'My notebooks' : `${file.owner}'s notebooks`
        }, ...file.path, {id: file.id, name: file.name}];
      }
    })
    .else(() => scope.vm.state.value({file}));
}

export function setFiles(scope: IScope, files: IFile[]) {
  scope.vm.state
    .force('Result', !!files, {files})
    .set('Content', () => !!files.length, {files})
    .then(() => scope.vm.fields = initTableFields(scope));
}

export function setMarkedMap(scope: IScope, markedMap: Record<string, IFile>) {
  scope.vm.marked.map = markedMap;
}

export function setMarkedList(scope: IScope, markedList: IFile[]) {
  scope.vm.marked.list = markedList;
  scope.vm.marked.toggle(!!markedList.length);
}
