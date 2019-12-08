import {INote} from '@wix/quix-shared';

export function setError(scope: ng.IScope, error: any) {
  scope.vm.state.force('Error', !!error, {error});
}

export function setNote(scope: ng.IScope, note: INote) {
  scope.vm.state.set('Content', !!note, {note});
}
