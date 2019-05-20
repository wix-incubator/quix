import {IScope} from './users-types';
import {initTableFields} from './users-table-fields';
import {IUser} from '../../../../shared';

export function setUsers(scope: IScope, users: IUser[]) {
  scope.vm.state
    .set('Result', !!users, {users})
    .set('Content', () => !!users.length, {users})
    .then(() => scope.vm.fields = initTableFields(scope));
}

export function setError(scope: IScope, error: any) {
  scope.vm.state.force('Error', !!error, {error});
}
