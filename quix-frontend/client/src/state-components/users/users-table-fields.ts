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
    name: 'email',
  }, {
    name: 'dateCreated',
    title: 'Join  Date',
    filter(_, user: IUser, index, compile) {
      return compile(`
        <span class="bi-text--sm bi-muted">{{::user.dateCreated | biRelativeDate}}</span>
      `, {user}, scope);
    }
  }, {
    name: 'dateUpdated',
    title: 'Last Login',
    filter(_, user: IUser, index, compile) {
      return compile(`
        <span class="bi-text--sm bi-muted">{{::user.dateUpdated | biRelativeDate}}</span>
      `, {user}, scope);
    }
  }];
};
