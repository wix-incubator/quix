import {config, login as ssoLogin} from './sso';
import {User} from './user';

export const getAuthStates = (appId: string, googleClientId: string, user: User) => {
  config(googleClientId);

  return [{
    name: 'auth',
    options: {
      abstract: true,
      template: '<div class="bi-c-h bi-grow" ui-view bi-state-loader></div>',
      resolve: {
        user() {
          return user.fetch(appId)
            .catch(e => [401, 403].indexOf(e.status) !== -1 && ssoLogin(appId).then(data => user.set(data.payload || data)));
        }
      }
    }
  }, {
    name: 'auth.content',
    options: {
      abstract: true,
      template: '<div class="bi-c-h bi-grow" ui-view bi-state-loader></div>'
    }
  }];
};
