import {login} from './sso';
import {User} from './user';

export const getAuthStates = (apiBasePath: string, googleClientId: string, user: User) => {
  return [{
    name: 'auth',
    options: {
      abstract: true,
      template: '<div class="bi-c-h bi-grow" ui-view bi-state-loader></div>',
      resolve: {
        user() {
          return user.fetch(apiBasePath)
            .catch(e => {
              if ([401, 403].indexOf(e.status) !== -1) {
                return login(googleClientId, apiBasePath);
              }

              return Promise.reject(e);
            })
            .then(data => user.set(data.payload || data));
        }
      }
    }
  }];
};
