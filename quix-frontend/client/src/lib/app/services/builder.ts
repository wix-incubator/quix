import {mapValues, last} from 'lodash';
import {paramCase, camelCase} from 'change-case';
import {srv, inject} from '../../core';
import {IBranches} from '../../../lib/store/services/store';
import {createStore, Store} from '../../../lib/store';
import Navigator from './navigator';
import Instance, {IMenuItem} from './instance';
import PluginInstance, {IPluginComponent, IStateFactory, IPluginBranches, IStateComponentFactory, IStateComponentConfig, IUrlParamListener} from './plugin-instance';
import {initScopeListeners} from '../utils/scope-utils';
import {User} from './user';

export type PluginFactory = (app: PluginInstance) => any;

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
 *  - register a BI logger
 */
export default class Builder<Logger = any> extends srv.eventEmitter.EventEmitter {
  private readonly plugins: {[key: string]: PluginInstance} = {};
  private appstore: Store = null;
  private readonly navigator: Navigator;
  private readonly user: User;
  private biLogger: any;
  private readonly menuItems: IMenuItem[] = [];
  private readonly title: string;
  private conf: Record<string, any>;

  constructor(private readonly id: string | {id: string; title: string}, private readonly ngApp: angular.IModule, private options: {
    statePrefix?: string;
    defaultUrl?: string;
    auth?: {googleClientId: string};
    homeState?: string;
    logoUrl?: string;
  }, private ngmodules = []) {
    super();

    this.user = new User();

    if (typeof id === 'object') {
      this.id = id.id;
      this.title = id.title;
    } else {
      this.title = id;
    }

    this.navigator = new Navigator({
      statePrefix: typeof options.statePrefix === 'undefined' ? 'auth.content.' : options.statePrefix,
      defaultUrl: options.defaultUrl || '/',
      auth: options.auth,
      homeState: options.homeState
    }).init(null, this.user, ngApp);
  }

  /**
   * Registers an application plugin
   *
   * @param id        plugin id
   * @param factory   plugin factory
   */
  plugin(id: string, factory: (pluginInstance: PluginInstance) => any): Builder<Logger> {
    this.plugins[id] = new PluginInstance(id, this);

    factory(this.plugins[id]);

    return this;
  }

  /**
   * Registers a ui-router state
   *
   * @param options   ui-router state options
   */
  state(options: any): Builder<Logger> {
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
  component(name: string, factory: angular.IDirectiveFactory): Builder<Logger> {
    this.ngApp.directive(name, factory);
    return this;
  }

  /**
   * Registers a state component
   *
   * @param name      state component name
   * @param config    state component config
   */
  stateComponent(config: IStateComponentConfig, app: Instance, store: Store): Builder<Logger> {
    function fromUrl(url: {[key: string]: IUrlParamListener}, params: object) {
      const actions = Object.keys(url).map(param => (url as any)[param].from(params[param]));
      store.dispatch(actions);
    }

    const [stateName, paramName] = config.name.split(':');
    const componentName = `${app.getId()}-${paramCase(stateName)}`;

    this.state({
      name: stateName,
      abstract: config.abstract || false,
      url: config.abstract ? '' : `/${last(stateName.split('.'))}${paramName ? `/:${paramName}` : ''}?${Object.keys(config.url)}`,
      reloadOnSearch: false,
      template: `
        <${componentName}
          class="bi-c-h bi-grow"
          ${Object.keys(config.scope).map(prop => `${paramCase(prop)}="${prop}"`).join(' ')}
          $state-options="$stateOptions"
        ></${componentName}>
      `,
      params: config.options || {},
      onExit: config.onExit,
      controller: ['$scope', '$stateParams', 'user', (scope, params) => {
        config.controller(scope, params, {
          syncUrl: (getArgs = () => []) => {
            let {url} = config;

            url = mapValues(url, (listener: IUrlParamListener, param) => {
              let normalizedListener = listener;

              if (typeof listener === 'function') {
                normalizedListener = {from: listener, to: action => listener(action[param])[param]};
              }

              const enrichedListener = mapValues(normalizedListener, (l, key) => value => normalizedListener[key](typeof value === 'undefined' ? null : value, ...getArgs()));

              userActionToUrlParam[(enrichedListener as any).from().type] = {param, listener: enrichedListener};

              return enrichedListener;
            });

            fromUrl(url, inject('$location').search());
            inject('$timeout')(() => {
              const cleaner = scope.$on('$locationChangeSuccess', () => fromUrl(url, inject('$location').search()));
              scope.$on('$destroy', () => cleaner());
            });
          }
        });

        scope.$stateOptions = Object.keys(config.options || {})
          .reduce((res, key) => {
            res[key] = params[key];
            return res;
          }, {});
      }]
    });

    this.component(camelCase(componentName), () => ({
      restrict: 'E',
      template: config.template,
      scope: mapValues({...config.scope, $stateOptions: true}, () => '<'),
      link: {
        pre(scope, ...args) {
          initScopeListeners(scope, store, config.scope);
          (config.link as any)(scope, ...args);
        }
      }
    }));

    return this;
  }

  /**
   * Registers a BI logger
   *
   * @param logger schema logger (https://github.com/wix-private/bi-schema-loggers)
   */
  logger(logger: Logger): Builder<Logger> {
    this.biLogger = logger;

    return this;
  }

  /**
   * Creates a redux store
   *
   * @param branches    store branches
   * @param logUrl      events log url
   */
  store(branches?: IBranches, logUrl?: string) {
    if (branches) {
      this.appstore = createStore(branches, {logUrl});
      return this;
    }
      return this.appstore;

  }

  modules(modules: string[]) {
    this.ngmodules = this.ngmodules.concat(modules);
  }

  menuItem(item: IMenuItem) {
    this.menuItems.push(item);
    return this;
  }

  config(config: Record<string, any> = {}) {
    this.conf = config;
    return this;
  }

  getUser() {
    return this.user;
  }

  /**
   * Creates an application instance
   */
  build(): Instance<Logger> {
    const app = new Instance<Logger>(
      this.id as string,
      this.title, 
      this.options.logoUrl,
      this.plugins,
      this.user,
      this.navigator,
      this.biLogger,
      this.menuItems,
      this.appstore,
      this.conf,
    )
      .init(this.ngmodules);

    Object.keys(this.plugins).forEach(name => {
      const plugin = this.plugins[name];
      const {branches, logUrl, server} = plugin.store() as IPluginBranches<Logger>;

      const intializedBranches = mapValues({
        ...branches,
        _global: () => next => next(x => null, urlMiddleware)
      } as any, branch => branch(app))

      const store = createStore(intializedBranches, {logUrl, server});

      (plugin.states() as IStateFactory<Logger>[]).forEach(factory => this.state(factory(app, store)));
      (plugin.components() as IPluginComponent<Logger>[]).forEach(({name: componentName, factory}) => this.component(componentName, factory(app, store)));
      (plugin.stateComponents() as IStateComponentFactory[]).forEach(factory => this.stateComponent(factory(app, store), app, store));

      this.fire(`ready|${plugin.getId()}`, app, store);
    });

    this.fire('ready', app);

    return app;
  }
}
