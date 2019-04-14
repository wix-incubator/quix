import template from './search-results.html';
import './search-results.scss';
import 'highlight.js/styles/tomorrow.css';

import hljs from 'highlight.js';
import {initNgScope, inject} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {INote} from '../../../../shared';
import {IScope} from './search-results-types';
import * as Resources from '../../services/resources';
import * as AppActions from '../../store/app/app-actions';
import {assign} from 'lodash';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          text: null,
          notes: null
        })
        .withEvents({
          onNoteClick(note: INote) {
            app.getNavigator().go('base.notebook', {id: note.notebookId, noteId: note.id});
          },
          onClose() {
            store.dispatch(AppActions.search(null));
          }
        });

      scope.renderNoteContent = (note: INote) => ({
        html: inject('$compile')(`<div ng-bind-html="html | biHighlight:vm.text"></div>`)(assign(scope.$new(), {
          html: hljs.highlight('sql', note.content).value
        }))
      });

      store.subscribe('app.searchText', text => text && Resources.search(text).then(notes => {
        scope.vm.text = text;
        scope.vm.notes = notes;
      }), scope);
    }
  }
});
