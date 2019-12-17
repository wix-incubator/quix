import {mapValues, last} from 'lodash';
import {paramCase, camelCase, headerCase} from 'change-case';
import {srv, inject, utils} from '../../core';
import {createStore, Store} from '../../../lib/store';
import Navigator from './navigator';
import {App, IMenuItem} from './app';
import {
  PluginBuilder,
  IPluginComponent,
  IStateFactory,
  IPluginBranches,
  IStateComponentFactory,
  IUrlParamListener,
  IReactStateComponentConfig, IAngularStateComponentConfig, IStateComponentConfig
} from './plugin-builder';
import {initScopeListeners} from '../utils/scope-utils';
import {User} from './user';
import {LocalStorage} from '../../core/srv/local-storage';
import {Options} from '../types';
import {react2angular} from 'react2angular';
import { withAppStoreProvider } from './appStoreProvider';

export type PluginFactory<Config> = (app: PluginBuilder<Config>) => any;

const userActionToUrlParam = {};
const urlMiddleware = str => next => action => {
  next(action);

  if (action.origin !== 'user' || !userActionToUrlParam[action.type]) {
    return;
  }

  const location = inject('$location');
  const {param, listener} = userActionToUrlParam[action.type];

  location.search({...location.search(), [param]: listener.to(action)});
};

/**
 * Application instance builder
 *
 * Allows to:
 *  - register application plugins
 *  - register application states
 *  - register menu items
 */
export class Builder<Config = any> extends srv.eventEmitter.EventEmitter {
  private readonly plugins: {[key: string]: PluginBuilder<Config>} = {};
  private readonly navigator: Navigator;
  private readonly user: User;
  private readonly menuItems: IMenuItem[] = [];
  private readonly title: string;
  private conf: Config;

  constructor(
    private readonly id: string | {
      id: string;
      title: string;
    },
    private readonly ngApp: angular.IModule,
    private readonly options: Options,
    private ngmodules = []
  ) {
    super();

    this.user = new User();

    if (typeof id === 'object') {
      this.id = id.id;
      this.title = id.title;
    } else {
      this.title = id;
    }

    this.navigator = new Navigator({
      ...options,
      statePrefix: typeof options.statePrefix === 'undefined' ? 'auth.content.' : options.statePrefix,
      defaultUrl: options.defaultUrl || '/',
    }).init(this.user, ngApp);
  }

  /**
   * Registers an application plugin
   *
   * @param id        plugin id
   * @param factory   plugin factory
   */
  plugin(id: string, factory: (pluginBuilder: PluginBuilder<Config>) => any): Builder<Config> {
    this.plugins[id] = new PluginBuilder(id, this);

    factory(this.plugins[id]);

    return this;
  }

  /**
   * Registers a ui-router state
   *
   * @param options   ui-router state options
   */
  state(options: any): Builder<Config> {
    const {name} = options;
    delete options.name;

    this.navigator.state(name, options);

    return this;
  }

  /**
   * Registers an angular directive
   *
   * @param name      component name
   * @param factory   component factory
   */
  component(name: string, factory: angular.IDirectiveFactory): Builder<Config> {
    this.ngApp.directive(name, factory);
    return this;
  }

  reactComponent(name: string, factory: angular.IComponentOptions): Builder<Config> {
    this.ngApp.component(name, factory);
    return this;
  }

  /**
   * Registers a state component
   *
   * @param config    state component config
   */
  stateComponent(config: IStateComponentConfig, app: App, store: Store): Builder<Config> {
    function fromUrl(scope, url: {[key: string]: IUrlParamListener}, params: object) {
      const actions = Object.keys(url).map(param => (url as any)[param].from(params[param]));

      utils.scope.safeDigest(scope, () => store.dispatch(actions));
    }

    const [fullStateName, paramName] = config.name.split(':');
    const stateParts = fullStateName.split('.');
    const stateName = last(stateParts);
    const componentName = [app.getId(), paramCase(stateParts.join('_'))].filter(x => !!x).join('-');

    this.state({
      name: fullStateName,
      abstract: config.abstract || false,
      url: config.abstract ? '' : `/${fullStateName.replace('.', '/')}${paramName ? `/:${paramName}` : ''}?${Object.keys(config.url)}`,
      reloadOnSearch: false,
      template: `
        <${componentName}
          class="bi-c-h bi-grow"
          ${Object.keys(config.scope).map(prop => `${paramCase(prop)}="${prop}"`).join(' ')}
          $state-options="$stateOptions"
        ></${componentName}>
      `,
      params: config.options || {},
      onEnter: config.onEnter,
      onExit: config.onExit,
      controller: ['$scope', '$stateParams', 'user', (scope, params) => {
        config.controller(scope, params, {
          syncUrl(getArgs = () => []) {
            let {url} = config;

            url = mapValues(url, (listener: IUrlParamListener, param) => {
              let normalizedListener = listener;

              if (typeof listener === 'function') {
                normalizedListener = {from: listener, to: action => listener(action[param])[param]};
              }

              const enrichedListener = mapValues(normalizedListener, (l, key) => value => normalizedListener[key](typeof value === 'undefined' ? null : value, ...getArgs()));

              userActionToUrlParam[(enrichedListener as any).from().type] = {param, listener: enrichedListener};

              return enrichedListener;
            }) as {[key: string]: IUrlParamListener};

            fromUrl(scope, url, inject('$location').search());
            inject('$timeout')(() => {
              const cleaner = scope.$on('$locationChangeSuccess', () => fromUrl(scope, url, inject('$location').search()));
              scope.$on('$destroy', () => cleaner());
            });
          },
          setTitle(getTitle = () => [app.getTitle(), headerCase(stateName)]) {
            document.title = getTitle({
              appTitle: app.getTitle(),
              stateName: headerCase(stateName)
            }).join(' · ');
          }
        });

        scope.$stateOptions = Object.keys(config.options || {})
          .reduce((res, key) => {
            res[key] = params[key];
            return res;
          }, {});
      }]
    });

    const isAngularConfig = (unknownConfig: IStateComponentConfig): unknownConfig is IAngularStateComponentConfig => {
      return typeof (unknownConfig as IAngularStateComponentConfig).template === 'string';
    };

    const createAngularFactory = (angularConfig: IAngularStateComponentConfig) => () => ({
      restrict: 'E',
      template: angularConfig.template,
      scope: mapValues({...angularConfig.scope, $stateOptions: true}, () => '<'),
      link: {
        pre(scope, ...args) {
          initScopeListeners(scope, store, angularConfig.scope);
          (angularConfig.link as any)(scope, ...args);
        }
      }
    });

    const createReactFactory = (reactConfig: IReactStateComponentConfig) =>
      react2angular(withAppStoreProvider(app, store, reactConfig.template),
        Object.keys(reactConfig.scope));

    isAngularConfig(config) ?
      this.component(camelCase(componentName), createAngularFactory(config)):
      this.reactComponent(camelCase(componentName), createReactFactory(config));

    return this;
  }

  modules(modules: string[]) {
    this.ngmodules = this.ngmodules.concat(modules);
  }

  menuItem(item: IMenuItem) {
    this.menuItems.push(item);
    return this;
  }

  config(config: Config) {
    this.conf = config;
    return this;
  }

  getUser() {
    return this.user;
  }

  /**
   * Creates an application instance
   */
  build(): App<Config> {
    const app = new App<Config>(
      this.id as string,
      this.title,
      this.options,
      this.plugins,
      this.user,
      this.navigator,
      this.menuItems,
      this.conf,
    )
      .init(this.ngmodules);

    Object.keys(this.plugins).forEach(name => {
      const plugin = this.plugins[name];
      const {branches, logUrl, server} = plugin.store() as IPluginBranches<Config>;

      const intializedBranches = mapValues({
        ...branches,
        _global: () => next => next(x => null, urlMiddleware)
      } as any, branch => branch(app))

      const store = createStore(intializedBranches, {logUrl, server});

      (plugin.states() as IStateFactory<Config>[]).forEach(factory => this.state(factory(app, store)));
      (plugin.components() as IPluginComponent<Config>[]).forEach(({name: componentName, factory}) => this.component(componentName, factory(app, store)));
      (plugin.stateComponents() as IStateComponentFactory[]).forEach(factory => this.stateComponent(factory(app, store), app, store));

      this.fire(`ready|${plugin.getId()}`, app, store);
    });

    LocalStorage.setPrefix(`${this.id}-`);

    this.fire('ready', app);

    return app;
  }
}
