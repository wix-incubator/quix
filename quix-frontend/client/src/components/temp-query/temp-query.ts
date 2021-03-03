import template from './temp-query.html';
import './temp-query.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './temp-query-types';
import { NotePlugin } from '../../services/plugins';

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    type: '<',
    textContent: '<',
    richContent: '<',
    autorun: '<'
  },
  link: {
    pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          $import({engines} = {engines: {}}) {
            scope.vm.engines = engines || {};
          },
          $export() {
            return {engines: scope.vm.engines};
          },
          runner: {
            enabled: false,
          },
          pluginFilter(plugin: NotePlugin) {
            return plugin.getConfig().canCreate;
          },
          $init() {
            this.engines = {};
            this.plugin = null;
          }
        })
        .withEvents({
          onContentChange(textContent, richContent) {
            const engine = scope.vm.plugin.getEngine();
            const engineContent = scope.vm.engines[engine] = scope.vm.engines[engine] || {};

            engineContent.textContent = textContent;
            engineContent.richContent = richContent;

            scope.state.save();
          },
          onPluginLoad(plugin: NotePlugin) {
            const engine = plugin.getEngine();
            const engineContent = scope.vm.engines[engine] = scope.vm.engines[engine] || {};

            engineContent.textContent = scope.textContent || engineContent.textContent || '';
            engineContent.richContent = scope.richContent || engineContent.richContent;

            scope.vm.plugin = plugin;
            scope.vm.runner.reload();
          },
          onPluginChange(plugin: NotePlugin) {
            const engine = plugin.getEngine();
            const engineContent = scope.vm.engines[engine] = scope.vm.engines[engine] || {};

            engineContent.textContent = engineContent.textContent || '';
            engineContent.richContent = engineContent.richContent;

            scope.vm.plugin = plugin;
            scope.vm.runner.reload();
          }
        })
        .withState('playground', 'playground', {});
    }
  }
});
