import {Store} from '../../../lib/store';
import angular from 'angular';
import Navigator from './navigator';
import {User} from './user';

export interface IMenuItem {
  icon: string;
  name?: string;
  state?: string;
  template?: string;
  compiled?: string;
  onToggle?(app: Instance, item: IMenuItem): any;
}

export default class Instance<Config = any> {
  private ngModule: angular.IModule;

  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly logoUrl: string,
    private readonly plugins,
    private readonly user: User,
    private readonly navigator: Navigator,
    private readonly menuItems: IMenuItem[],
    private readonly store: Store,
    private readonly config: Config,
  ) { }

  init(modules: string[] = []) {
    this.ngModule = angular.module(this.id, ['bi.app'].concat(modules));
    return this;
  }

  getId() {
    return this.id;
  }

  getTitle() {
    return this.title;
  }

  getLogoUrl() {
    return this.logoUrl;
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

  go(state: string, params?: Object, options?) {
    this.navigator.go(state, params, options);
  }
}
