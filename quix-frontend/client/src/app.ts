import './lib/ui/bootstrap';
import './app.scss';
import create from './lib/app';
import * as components from './components';
import * as stateComponents from './state-components';
import {branches, initCache} from './store';
import UrlPattern from 'url-pattern';
import {config as runnerConfig} from './lib/runner';
import './lib/file-explorer';
import {setupNotifications} from './bootstrap';
import {ClientConfigHelper} from '../../shared';

(window as any).UrlPattern = UrlPattern;  // expose for e2e tests
const clientConfig = ClientConfigHelper.load(window.quixConfig);
const {staticsBaseUrl, quixBackendUrl} = clientConfig.getClientTopology();

create<ClientConfigHelper>({
  id: 'quix',
  title: 'Quix'
}, {
    auth: clientConfig.getAuth(),
    statePrefix: 'base',
    defaultUrl: '/home',
    homeState: 'home',
    logoUrl: `${staticsBaseUrl}assets/logo.png`
  }, ['bi.app', 'bi.runner', 'bi.fileExplorer'])
  .config(clientConfig)
  .plugin('app', plugin => {
    plugin.components(components);
    plugin.stateComponents(stateComponents);
    plugin.store(branches, '/api/events', 'Node');

    plugin.menuItem({name: 'Notebooks', icon: 'description', template: '<quix-files-sidebar class="bi-c bi-grow"></quix-files-sidebar>'});
    plugin.menuItem({name: 'DB Explorer', icon: 'storage', template: '<quix-db-sidebar class="bi-c bi-grow"></quix-db-sidebar>'});

    plugin.onPluginReady((app, store) => {
      app.getModule().controller('app', ['$scope', scope => scope.app = app] as any);

      initCache(store);
      runnerConfig.set({baseUrl: quixBackendUrl});
      setupNotifications(staticsBaseUrl);
    });
  })
  .build();
