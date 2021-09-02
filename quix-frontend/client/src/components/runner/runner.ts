import template from './runner.html';
import './runner.scss';

import { isArray } from 'lodash';
import { initNgScope, inject } from '../../lib/core';
import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IScope } from './runner-types';
import { pluginManager } from '../../plugins';
import { getFormatter } from './runner-results-formatter';
import { hooks } from '../../hooks';

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    type: '<',
    textContent: '=',
    richContent: '=',
    runner: '<',
    quixRunnerOptions: '<',
    renderStats: '&',
    getDownloadFileName: '&',
    onContentChange: '&',
    onSave: '&',
    onRun: '&',
    onEditorInstanceLoad: '&',
    onRunnerInstanceLoad: '&',
    onRunnerCreated: '&',
    onRunnerDestroyed: '&',
    onParamsShare: '&',
    readonly: '<',
  },
  link: {
    async pre(scope: IScope) {
      const plugin = pluginManager.module('note').plugin(scope.type);

      const autocompleteDbFetchers = hooks.note.config.editor.autocompleteDbFetchers.call(
        app,
        store,
        plugin.getEngine()
      );

      if (isArray(autocompleteDbFetchers)) {
        scope.autocompleteDbFetchers = autocompleteDbFetchers;
      }

      initNgScope(scope)
        .withOptions('quixRunnerOptions', {
          focusEditor: true,
          showEditor: true,
          autoRun: false,
          shareParams: true,
        })
        .withVM({
          $init() {
            this.type = plugin.getId();
            this.engine = plugin.getEngine();
            this.showSyntaxErrors = plugin.getConfig().syntaxValidation;
            this.dateFormat = plugin.getConfig().dateFormat;
          },
        })
        .withEvents({
          onContentChange(textContent, richContent) {
            return (
              !scope.readonly &&
              scope.onContentChange({ textContent, richContent })
            );
          },
          onSave() {
            return !scope.readonly && scope.onSave();
          },
          onRun() {
            return scope.onRun();
          },
          onEditorInstanceLoad(instance) {
            return scope.onEditorInstanceLoad({ instance });
          },
          onRunnerInstanceLoad(instance) {
            instance.setUser(app.getUser());

            return scope.onRunnerInstanceLoad({ instance });
          },
          onRunnerCreated(runner) {
            return scope.onRunnerCreated({ runner });
          },
          onRunnerDestroyed(runner) {
            return scope.onRunnerDestroyed({ runner });
          },
          onParamsShare(params) {
            return scope.onParamsShare({ params });
          },
        })
        .withActions({
          getDownloadFileName(query) {
            return scope.getDownloadFileName({ query });
          },
          renderStats() {
            return scope.renderStats();
          },
        });

      scope.tableFormatter = () =>
        getFormatter(app, store, scope.vm.engine, scope.vm.type);

      scope.renderRunner = () => {
        const html = inject('$compile')(plugin.renderRunner())(scope);

        return { html };
      };
    },
  },
});
