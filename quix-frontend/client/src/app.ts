import './lib/ui/bootstrap';
import './app.scss';

import create from './lib/app';
import * as components from './components';
import * as stateComponents from './state-components';
import {branches, initCache} from './store';
import UrlPattern from 'url-pattern';
import {config as runnerConfig} from './lib/runner';
import {config as  resourcesConfig} from './services/resources';
import {setupNotifications} from './bootstrap';
import {ClientConfigHelper} from '../../shared';

import './lib/file-explorer';

(window as any).UrlPattern = UrlPattern;  // expose for e2e tests

const clientConfig = ClientConfigHelper.load(window.quixConfig);

const {
  staticsBaseUrl,
  executeBaseUrl,
  apiBasePath,
} = clientConfig.getClientTopology();

create<ClientConfigHelper>({
  id: 'quix',
  title: 'Quix',
}, {
    auth: clientConfig.getAuth(),
    statePrefix: 'base',
    defaultUrl: '/home',
    homeState: 'home',
    logoUrl: `${staticsBaseUrl}assets/logo.png`,
    apiBasePath
  }, ['bi.app', 'bi.runner', 'bi.fileExplorer'])
  .config(clientConfig)
  .plugin('app', plugin => {
    plugin.components(components);
    plugin.stateComponents(stateComponents);
    plugin.store(branches, `${apiBasePath}/api/events`, 'Node');

    plugin.menuItem({name: 'Notebooks', icon: 'description', template: '<quix-files-sidebar class="bi-c bi-grow"></quix-files-sidebar>'});
    plugin.menuItem({name: 'DB Explorer', icon: 'storage', template: '<quix-db-sidebar class="bi-c-h bi-grow"></quix-db-sidebar>'});

    plugin.onPluginReady((app, store) => {
      runnerConfig.set({
        executeBaseUrl,
        apiBasePath,
      });

      resourcesConfig.set({
        apiBasePath
      });

      initCache(store);
      setupNotifications(staticsBaseUrl);

      app.getModule().controller('app', ['$scope', scope => scope.app = app] as any);
    });
  })
  .build();
