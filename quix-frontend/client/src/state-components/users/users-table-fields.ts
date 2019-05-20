import {IUser} from '../../../../shared';

export const initTableFields = scope => {
  return [{
    name: 'name',
    title: 'user',
    filter(_, user: IUser, index, compile) {
      return compile(`
        <div class="bi-align bi-s-h">
          <img class="quix-user-avatar" ng-src="{{::user.avatar}}"/>
          <span>{{::user.name}}</span>
        </div>
      `, {user}, scope);
    }
  }, {
    name: 'id',
    title: 'email'
  }];
};
