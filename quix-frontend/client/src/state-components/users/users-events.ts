import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IUser} from '../../../../shared';

export const onUserClick = (scope, store: Store, app: App) => (user: IUser) => {
  app.go('files', {id: user.rootFolder});
};
