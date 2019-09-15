import {StoreCache} from '../../lib/store';
import {setUsers, setError} from './users-actions';
import {users} from '../../services/resources';
import {IUser} from '@wix/quix-shared';

export default store => new StoreCache<IUser[]>(store, 'users.users')
  .cacheWith(setUsers)
  .catchWith(setError)
  .fetchWith(users);
