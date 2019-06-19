import {IScope} from './favorites-types';
import {initTableFields} from './favorites-table-fields';
import {IFile} from '../../../../shared';

export function setFavorites(scope: IScope, favorites: IFile[]) {
  scope.vm.state
    .force('Result', !!favorites, {favorites})
    .set('Content', () => !!favorites.length, {favorites})
    .then(() => scope.vm.fields = initTableFields(scope));
}

export function setError(scope: IScope, error: any) {
  scope.vm.state.force('Error', !!error, {error});
}
