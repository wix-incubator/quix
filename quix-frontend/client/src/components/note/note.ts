import template from './note.html';
import './note.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './note-types';
import { initEvents} from '../../services/scope';
import * as Events from './note-events';
import {RunnerQuery} from '../../lib/runner';
import { pluginManager } from '../../plugins';

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    note: '<',
    permissions: '<',
    quixNoteOptions: '<',
    marked: '<',
    runner: '<',
    onContentChange: '&',
    onNameChange: '&',
    onShare: '&',
    onClone: '&',
    onDelete: '&',
    onMarkToggle: '&',
    onSave: '&',
    onRun: '&',
    onRunnerCreated: '&',
    onRunnerDestroyed: '&'
  },
  link: {
    async pre(scope: IScope) {
      const conf = initNgScope(scope)
        .withOptions('quixNoteOptions', {
          fold: false,
          focusName: false,
          focusEditor: true,
          autoRun: false,
          maximizable: true,
        }, () => {
          if (scope.options.focusName) {
            scope.options.focusEditor = false;
          }

          scope.vm.isFolded = scope.options.fold;
        })
        .withVM({
          editor: null,
          runner: null,
          isFolded: false,
          isMaximized: false,
          $init() {
            const plugin = pluginManager.module('note').plugin(scope.note.type);
            this.showSyntaxErrors = plugin.getConfig().syntaxValidation;
            this.type = plugin.getId();
            this.engine = plugin.getEngine();
          }
        });

      initEvents(scope, conf, app, store, Events);

      scope.getDownloadFileName = (query: RunnerQuery) => {
        return `${scope.note.name}${query.getIndex() > 0 ? `_${query.getIndex()}` : ''}.csv`
      }
    }
  }
});
