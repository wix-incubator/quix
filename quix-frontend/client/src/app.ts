import './lib/ui/bootstrap';
import './app.scss';

import create from './lib/app';
import * as components from './components';
import * as stateComponents from './state-components';
import {branches, initCache} from './store';

import UrlPattern from 'url-pattern';
import './lib/runner';
import './lib/file-explorer';

(window as any).UrlPattern = UrlPattern;  // expose for e2e tests

const {googleClientId, staticsBaseUrl, ...config} = (window as any).quixConfig;

create({
  id: 'quix',
  title: 'Quix'
}, {
  auth: {googleClientId},
  defaultUrl: '/home',
  homeState: 'base.home',
  logoUrl: `${staticsBaseUrl}assets/logo.png`
}, ['bi.app', 'bi.runner', 'bi.fileExplorer'])
  .config(config)
  .plugin('app', plugin => {
    plugin.components(components);
    plugin.stateComponents(stateComponents);
    plugin.store(branches, '/api/events', 'Node');

    plugin.menuItem({name: 'Notebooks', icon: 'description', template: '<quix-files-sidebar class="bi-c bi-grow"></quix-files-sidebar>'});
    plugin.menuItem({name: 'DB Explorer', icon: 'dns', template: '<quix-db-sidebar class="bi-c bi-grow"></quix-db-sidebar>'});

    plugin.onPluginReady((app, store) => {
      initCache(store);

      app.getModule().controller('app', ['$scope', scope => scope.app = app] as any);
    });
  })
  .build();
