import {IScope} from './notebook-types';
import {INotebook, INote} from '@wix/quix-shared';

export function setNotebook(scope: IScope, notebook: INotebook) {
  scope.vm.state
    .set('Result', !!notebook, {notebook})
    .then(() => {
      if (scope.vm.breadcrumbs.length === 1) {
        scope.vm.breadcrumbs = [...notebook.path, {id: notebook.id, name: notebook.name}];

        if (!scope.permissions.edit) {
          scope.vm.breadcrumbs[0].name = `${notebook.ownerDetails.name}'s notebooks`;
        }
      }
    })
    .else(() => scope.vm.state.value({notebook}));
}

export function setError(scope: IScope, error: any) {
  scope.vm.state.force('Error', !!error, {error});
}

export function setNotes(scope: IScope, notes: INote[]) {
  scope.vm.state
    .force('Result', !!notes, {notes})
    .set('Content', () => !!notes.length, {notes})
    .then(() => {
      const vm = scope.vm.notes.get(notes[0]);
      vm.fold = vm.fold === null ? notes.length > 1 : vm.fold;
    });
}

export function setHasChanges(scope: IScope, hasChanges: boolean) {
  scope.vm.view.hasChanges = hasChanges;
}

export function setMarkedMap(scope: IScope, markedMap: Record<string, INote>) {
  scope.vm.marked.map = markedMap;
}

export function setMarkedList(scope: IScope, markedList: INote[]) {
  scope.vm.marked.list = markedList;
  scope.vm.marked.toggle(!!markedList.length);
}

export function setNote(scope: IScope, note: INote) {
  scope.vm.state.value({note});

  if (note) {
    scope.vm.notes.get(note).fold = false;
  }
}
