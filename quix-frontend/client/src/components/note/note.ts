import template from './note.html';
import './note.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './note-types';
import { initEvents} from '../../services/scope';
import * as Events from './note-events';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    note: '<',
    quixNoteOptions: '<',
    marked: '<',
    runner: '<',
    readonly: '<',
    onContentChange: '&',
    onNameChange: '&',
    onShare: '&',
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
          focusEditor: true
        }, () => {
          if (scope.options.focusName) {
            scope.options.focusEditor = false;
          }
        })
        .withVM({
          editor: null,
          runner: null,
        });

      initEvents(scope, conf, app, store, Events);
    }
  }
});
