import {setupNotifications} from './bootstrap';
import create from './lib/app';
import {hooks} from './hooks';
import * as components from './components';
import * as stateComponents from './state-components';
import {branches, initCache} from './store';
import {config as runnerConfig} from './lib/runner';
import {config as resourcesConfig} from './services/resources';
import {pluginManager} from './plugins';
import {ClientConfigHelper, ModuleComponentType} from '@wix/quix-shared';
import {openTempQuery} from './services';
import {inject} from './lib/core';

export {hooks} from './hooks';

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
  ['bi.app', 'bi.runner', 'bi.fileExplorer'],
)
  .config(clientConfig)
  .plugin('app', plugin => {
    plugin.components(components);
    plugin.stateComponents(stateComponents);
    plugin.store(branches, `${apiBasePath}/api/events`, 'Node');

    plugin.menuItem({
      name: 'Notebooks',
      icon: 'description',
      template:
        '<quix-files-sidebar class="bi-c bi-grow"></quix-files-sidebar>',
    });
    plugin.menuItem({
      name: 'DB Explorer',
      icon: 'storage',
      template: '<quix-db-sidebar class="bi-c-h bi-grow"></quix-db-sidebar>',
    });

    plugin.onPluginReady((app, store) => {
      runnerConfig.set({
        executeBaseUrl,
        apiBasePath,
      });

      resourcesConfig.set({
        apiBasePath,
      });

      clientConfig
        .getModulesByComponent(ModuleComponentType.Db)
        .forEach(({id, engine}) => {
          pluginManager.module(ModuleComponentType.Db).plugin(id, engine, app);
        });

      clientConfig
        .getModulesByComponent(ModuleComponentType.Note)
        .forEach(({id, engine}) => {
          pluginManager
            .module(ModuleComponentType.Note)
            .plugin(id, engine, app);
        });

      pluginManager
        .module(ModuleComponentType.Note)
        .plugin('default', 'default' as any);

      initCache(store);
      setupNotifications(staticsBaseUrl);

      app
        .getModule()
        .controller('app', ['$scope', scope => (scope.app = app)] as any);
    });
  });

hooks.bootstrap.call(appBuilder);

appBuilder.plugin('dummy', plugin => {
  plugin.menuItem({name: 'separator'});
  plugin.menuItem({
    name: 'Playground',
    icon: 'code',
    onToggle: () => openTempQuery(inject('$rootScope')),
  });
});

appBuilder.build();
