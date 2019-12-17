import {forEach} from 'lodash';
import {IDirectiveFactory, IDirectiveLinkFn} from 'angular';
import {Store, IBranch} from '../../store';
import {Builder} from './builder';
import {App, IMenuItem} from './app';
import {ServerFrameworkType} from '../../store/services/store-logger';
import * as React from 'react';

export type IComponentFactory<Config = any> = (app: App<Config>, store: Store) => IDirectiveFactory;

export type IStateFactory<Config = any> = (app: App<Config>, store: Store) => object;

export type IBranchFactory<Config = any> = (app: App<Config>) => IBranch;

export interface IPluginComponent<Config = any> {
  name: string;
  factory: IComponentFactory<Config>;
}

export interface IPluginBranches<Config = any> {
  branches: {[key: string]: IBranchFactory};
  logUrl: string;
  server?: ServerFrameworkType;
}

export type IStateComponentFactory<Config = any> = (app: App<Config>, store: Store) => IStateComponentConfig;

export type IUrlParamListener = Function | {from: Function; to: Function};

export type IScopeListener = (scope, current: any, previous: any, store: Store) => any
interface IScopeListeners extends Record<string, IScopeListener | IScopeListeners> {}

export interface IStateComponentConfigBase {
  name: string;
  abstract?: boolean;
  url: {[key: string]: IUrlParamListener};
  scope: IScopeListeners;
  options?: Record<string, any>,
  controller(scope: any, params: {[key: string]: any}, api: {
    syncUrl(getArgs?: () => any): any;
    setTitle(getTitle?: (args: {
      appTitle?: string;
      stateName?: string;
    }) => string[]): any;
  }): any;
  onEnter?(): any;
  onExit?(): any;
}

export interface IAngularStateComponentConfig extends IStateComponentConfigBase{
  template: string;
  link: IDirectiveLinkFn;
}

export interface IReactStateComponentConfig extends IStateComponentConfigBase{
  template: React.ComponentType<any>;
}
export type IStateComponentConfig = IAngularStateComponentConfig | IReactStateComponentConfig;
/**
 * A subset of Builder which is exposed to plugin factories
 */
export class PluginBuilder<Config> {
  private readonly pluginStates = [];
  private readonly pluginComponents: IPluginComponent[] = [];
  private readonly pluginStateComponents: IStateComponentFactory[] = [];
  private pluginBranches: IPluginBranches = {logUrl: '', server: null, branches: {}};

  constructor(private readonly id: string, private readonly builder: Builder) {

  }

  /**
   * Registers a ui-router state
   *
   * @param options   ui-router state options
   */
  state(options: Object): PluginBuilder<Config> {
    this.builder.state(options);
    return this;
  }

  /**
   * Registers ui-router states
   *
   * @param states   ui-router states
   */
  states(states?: {[name: string]: IStateFactory}) {
    if (states) {
      forEach(states, factory => this.pluginStates.push(factory));
      return this;
    }
    return this.pluginStates;

  }

  /**
   * Registers an angular directive
   *
   * @param name      component name
   * @param factory   component factory
   */
  component(name: string, factory: IComponentFactory): PluginBuilder<Config> {
    this.pluginComponents.push({name, factory});
    return this;
  }

  /**
   * Registers angular directives
   *
   * @param components  directives
   */
  components(components?: {[name: string]: IComponentFactory}) {
    if (components) {
      forEach(components, (factory, name) => this.component(name, factory));
      return this;
    }
    return this.pluginComponents;

  }

   /**
   * Registers a state component
   *
   * @param factory   component factory
   */
  stateComponent(factory?: IStateComponentFactory) {
    this.pluginStateComponents.push(factory);
    return this;
  }

   /**
   * Registers a state component
   *
   * @param name      component name
   * @param factory   component factory
   */
  stateComponents(stateComponents?: {[name: string]: IStateComponentFactory}) {
    if (stateComponents) {
      forEach(stateComponents, (factory, name) => this.stateComponent(factory));
      return this;
    }
    return this.pluginStateComponents;

  }

  /**
   * Registers store branches
   *
   * @param branches    store branches
   * @param logUrl      log url
   * @param server
   */
  store(branches?: Record<string, IBranchFactory> , logUrl?: string, server?: ServerFrameworkType) {
    if (branches) {
      this.pluginBranches = {branches, logUrl, server};
      return this;
    }

    return this.pluginBranches;
  }

  modules(modules) {
    this.builder.modules(modules);
    return this;
  }

  menuItem(item: IMenuItem) {
    this.builder.menuItem(item);
    return this;
  }

  getUser() {
    return this.builder.getUser();
  }

  getId() {
    return this.id;
  }

  /**
   * Subscribes to application ready event
   *
   * @param fn  will be called with app's instance after app.build() was called
   */
  ready(fn: (app: App) => any) {
    this.builder.on('ready', fn);
  }

  /**
   * Subscribes to application ready event per plugin
   *
   * @param fn  will be called with app's instance after app.build() was called
   */
  onPluginReady(fn: (app: App<Config>, store: Store) => any) {
    this.builder.on(`ready|${this.id}`, fn);
  }
}