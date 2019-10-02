import {createStore, Store} from '../../store';
import angular from 'angular';
import Navigator from './navigator';
import {User} from './user';
import {login} from './sso';
import {Options} from '../types';

export interface IMenuItem {
  icon: string;
  name?: string;
  state?: string;
  template?: string;
  compiled?: string;
  onToggle?(app: App, item: IMenuItem): any;
}

export class App<Config = any> {
  private ngModule: angular.IModule;
  private readonly store: Store;

  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly options: Options,
    private readonly plugins,
    private readonly user: User,
    private readonly navigator: Navigator,
    private readonly menuItems: IMenuItem[],
    private readonly config: Config,
  ) {
    this.store = createStore({
      app: register => register((state = {
        header: true,
        menu: true,
      }, action) => {
        switch (action.type) {
          case 'toggle.header':
            return {...state, header: action.header};
          case 'toggle.menu':
            return {...state, menu: action.menu};
          default:  
        }

        return state;
      })
    });
  }

  init(modules: string[] = []) {
    this.ngModule = angular.module(this.id, ['bi.app'].concat(modules));
    return this;
  }

  login() {
    return login(this.options.auth.googleClientId, this.options.apiBasePath)
      .then(data => this.navigator.finishLogin(data));
  }

  getId() {
    return this.id;
  }

  getTitle() {
    return this.title;
  }

  getLogoUrl() {
    return this.options.logoUrl;
  }

  getUser(): User {
    return this.user;
  }

  getModule(): angular.IModule {
    return this.ngModule;
  }

  getNavigator(): Navigator {
    return this.navigator;
  }

  getPlugin(id: string) {
    return this.plugins[id];
  }

  getMenuItems() {
    return this.menuItems;
  }

  getStore() {
    return this.store;
  }

  getConfig() {
    return this.config;
  }

  toggleHeader(state: boolean) {
    this.store.dispatch({type: 'toggle.header', header: state});
  }

  toggleMenu(state: boolean) {
    this.store.dispatch({type: 'toggle.menu', menu: state});
  }

  go(state: string, params?: Object, options?) {
    this.navigator.go(state, params, options);
  }
}
