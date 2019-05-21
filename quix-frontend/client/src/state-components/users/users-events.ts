import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './users-types';
import {IUser} from '../../../../shared';

export const onUserClick = (scope: IScope, store: Store, app: Instance) => (user: IUser) => {
  app.go('files', {id: user.rootFolder});
};