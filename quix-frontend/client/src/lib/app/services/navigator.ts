import {IModule} from 'angular';
import {inject, srv} from '../../core';
import {User} from './user';
import {Options} from '../types';

const EVENT_MAP = {
  start: 'stateChangeStart',
  success: 'stateChangeSuccess',
  visible: 'viewLoaded'
};

export type TEventType = 'start' | 'success' | 'visible';

export type INavigatorCallback = (params: any, stateName: string) => any;

export default class Navigator extends srv.eventEmitter.EventEmitter {
  private readonly states = [];
  private prefix;
  private resolveLogin: (data: any) => any;

  constructor(private readonly options: Options) {
    super();
  }

  init(user: User, ngApp: IModule) {
    this.prefix = this.options.statePrefix;

    if (this.options.auth) {
      const self = this;

      this.states.push({
        name: 'auth',
        options: {
          abstract: true,
          template: '<div class="bi-c-h bi-grow" ui-view bi-state-loader></div>',
          resolve: {
            user() {
               return user.fetch(self.options.apiBasePath)
                .catch(() => {
                  user.toggleLoggedIn(false);
                  return new Promise(resolve => self.resolveLogin = resolve)
                })
                .then((data: any) => {
                  user.set(data.payload || data);
                  user.toggleLoggedIn(true);
                });
            }
          }
        }
      });

      this.prefix = `auth.${this.prefix}`;
    }

    ngApp.config([
      '$stateProvider',
      '$locationProvider',
      '$urlRouterProvider',
      ($stateProvider, $locationProvider, $urlRouterProvider) => {
        $locationProvider.hashPrefix('');
        $urlRouterProvider.otherwise(this.options.defaultUrl);

        this.states.forEach(({name, options}) => {
          try {
            $stateProvider.state(name, options);
          } catch (e) {
            console.warn(e);
          }
        });
      }]);

    ngApp.run(['$rootScope', (scope) => {
      scope.$on('$stateChangeStart', (e, state, params, fromState) => {
        this.trigger('stateChangeStart', state.name, params, fromState.name);
      });

      scope.$on('$stateChangeSuccess', (e, state, params, fromState) => {
        this.trigger('stateChangeSuccess', state.name, params, fromState.name);
      });

      scope.$on('$viewContentLoaded', (e, viewConfig) => this.trigger('viewLoaded'));
    }]);

    return this;
  }

  finishLogin(data: any) {
    if (this.resolveLogin) {
      this.resolveLogin(data);
    }
  }

  getStatePrefix() {
    return this.prefix;
  }

  state(name, options) {
    this.states.push({name: `${this.prefix}${name ? `.${name}` : ''}`, options});
  }

  go(state: string, params?: Object, options: {reload: boolean | string} = {reload: false}): PromiseLike<any> {
    if (typeof options.reload === 'string') {
      options.reload = `${this.prefix}.${options.reload}`;
    }

    return inject('$state').go(`${this.prefix}.${state}`, params, options);
  }

  getUrl(state?: string, params?: Object): string {
    state = state || inject('$state').current.name;

    return `${document.location.protocol}//${document.location.host}${document.location.pathname}${inject('$state').href(state, params, {relative: true, inherit: false})}`;
  }

  goHome() {
    return inject('$state').go(`${this.prefix}.${this.options.homeState}`);
  }

  listen(state: string | string[], type: TEventType, fn: INavigatorCallback, scope?) {
    const states = typeof state === 'string' ? [state] : state || [];
    const eventName = EVENT_MAP[type];
    let otherwise: INavigatorCallback = null;

    this.on(eventName, (stateName = '', params = {}) => {
      stateName = stateName.replace(`${this.getStatePrefix()}.`, '');
      if (states.some(s => stateName.indexOf(s) >= 0)) {
        fn(params, stateName);
      } else if (otherwise) {
        otherwise(params, stateName);
      }
    }, true, scope);

    return {
      otherwise(f: INavigatorCallback) {
        otherwise = f;
      }
    };
  }

  listenFrom(state: string | string[], type: TEventType, fn: Function, invoke = false, scope?) {
    const states = typeof state === 'string' ? [state] : state || [];
    const eventName = EVENT_MAP[type];
    let otherwise = null;

    this.on(eventName, (_, __, stateName) => {
      if (states.some(s => stateName.indexOf(s) >= 0)) {
        fn();
      } else if (otherwise) {
        otherwise();
      }
    }, invoke, scope);

    return {
      otherwise(f: Function) {
        otherwise = f;
      }
    };
  }

  reload(state?: string) {
    inject('$state').reload(state);
  }
}
