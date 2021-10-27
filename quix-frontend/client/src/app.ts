import { isArray } from 'lodash';
import { setupNotifications } from './bootstrap';
import create, { App } from './lib/app';
import { hooks } from './hooks';
import * as components from './components';
import * as stateComponents from './state-components';
import * as reactComponents from './react-components';
import { branches, initCache } from './store';
import { config as runnerConfig } from './lib/runner';
import { config as resourcesConfig } from './services/resources';
import { pluginManager } from './plugins';
import { ClientConfigHelper, ModuleComponentType } from '@wix/quix-shared';
import { openTempQuery } from './services';
import { inject } from './lib/core';
import {
  AUTO_PARAMS,
  AUTO_PARAM_DEFAULTS,
  AUTO_PARAM_TYPES,
} from './lib/code-editor/services/param-parser/param-types';
import { Store } from './lib/store';
import { setStats } from './store/app/app-actions';

export { hooks } from './hooks';

const clientConfig = ClientConfigHelper.load(window.quixConfig);

const {
  staticsBaseUrl,
  executeBaseUrl,
  apiBasePath,
} = clientConfig.getClientTopology();

const appBuilder = create<ClientConfigHelper>(
  {
    id: 'quix',
    title: 'Quix',
  },
  {
    auth: clientConfig.getAuth(),
    statePrefix: 'base',
    defaultUrl: '/home',
    homeState: 'home',
    logoUrl: `${staticsBaseUrl}assets/logo_big.png`,
    apiBasePath,
  },
  ['bi.app', 'bi.runner', 'bi.fileExplorer']
)
  .config(clientConfig)
  .plugin('app', (plugin) => {
    plugin.components(components);
    plugin.stateComponents(stateComponents);
    plugin.reactComponents(reactComponents);
    plugin.store(branches, `${apiBasePath}/api/events`, 'Node');

    plugin.menuItem({
      name: 'Notebooks',
      icon: 'description',
      template:
        '<quix-files-sidebar class="bi-c-h bi-grow"></quix-files-sidebar>',
    });

    plugin.menuItem({
      name: 'DB Explorer',
      icon: 'storage',
      template: '<quix-db-sidebar class="bi-c-h bi-grow"></quix-db-sidebar>',
    });

    plugin.onPluginReady((app, store) => {
      const autoParams = hooks.note.config.editor.autoParams.call(app, store);

      if (isArray(autoParams)) {
        autoParams.forEach(({ name, type, defaultValue }) => {
          AUTO_PARAMS.push(name);
          AUTO_PARAM_TYPES[name] = type;
          AUTO_PARAM_DEFAULTS[name] = defaultValue;
        });
      }

      runnerConfig.set({
        executeBaseUrl,
        apiBasePath,
      });

      resourcesConfig.set({
        apiBasePath,
      });

      clientConfig
        .getModulesByComponent(ModuleComponentType.Db)
        .forEach(({ id, engine }) => {
          pluginManager
            .module(ModuleComponentType.Db)
            .plugin(id, engine, app, store);
        });

      clientConfig
        .getModulesByComponent(ModuleComponentType.Note)
        .forEach(({ id, engine }) => {
          pluginManager
            .module(ModuleComponentType.Note)
            .plugin(id, engine, app, store);
        });

      pluginManager
        .module(ModuleComponentType.Note)
        .plugin('default', 'default' as any);

      initCache(store);
      setupNotifications(staticsBaseUrl);

      app.getModule().controller('app', [
        '$scope',
        (scope) => {
          scope.app = app;
          scope.store = store;
        },
      ] as any);

      app.getNavigator().on('ready', (user) => {
        store.dispatch(setStats(user.getStats()));
      });
    });
  });

hooks.bootstrap.call(appBuilder);

appBuilder.plugin('dummy', (plugin) => {
  plugin.menuItem({ name: 'separator' });
  plugin.menuItem({
    name: 'Trash Bin',
    icon: (app: App, store: Store, scope: any) => {
      scope = scope.$new(true);
      store.subscribe(
        'app.stats.trashBinCount',
        (count) => {
          scope.count = count;
        },
        scope
      );

      const trashIconHtml = /*html*/ `
       <bi-icon-with-badge count="count"  
                           hide="count <= 0"
                           class="bi-action"
                           ng-class="{'bi-active': item === vm.menu.current}"
                           >
         <i class="bi-icon"
            title="Trash Bin"
            role="button"
            data-hook="app-menu-trash-bin"
          >
          {{ count > 0 ? 'delete' : 'delete_outline' }}
          </i>
       </bi-icon-with-badge>`;

      return inject('$compile')(trashIconHtml)(scope);
    },
    onToggle: (app) => {
      app.go('trashBin');
    },
  });
  plugin.menuItem({ name: 'separator' });
  plugin.menuItem({
    name: 'Playground',
    icon: 'code',
    onToggle: () => openTempQuery(inject('$rootScope')),
  });
});

appBuilder.build();
