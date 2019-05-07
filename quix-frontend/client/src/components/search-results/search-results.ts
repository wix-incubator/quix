import template from './search-results.html';
import './search-results.scss';
import 'highlight.js/styles/tomorrow.css';

import {assign, debounce} from 'lodash';
import hljs from 'highlight.js';
import {initNgScope, inject} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {INote, IPrestoNote} from '../../../../shared';
import {IScope} from './search-results-types';
import * as Resources from '../../services/resources';
import * as AppActions from '../../store/app/app-actions';
import {StateManager, extractLinesAroundMatch} from '../../services';

enum States {
  Initial,
  Error,
  Result,
  Content,
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          text: null,
          $init() {
            this.state = new StateManager(States);
          }
        })
        .withEvents({
          onNoteClick(note: INote) {
            app.getNavigator().go('base.notebook', {id: note.notebookId, note: note.id});
          }
        });

      scope.renderNoteContent = (note: INote) => ({
        html: inject('$compile')(`
          <div ng-bind-html="html | biHighlight:vm.state.value().text"></div>
        `)(assign(scope.$new(), {
          html: hljs.highlight('sql', note.content).value
        }))
      });

      let searchId = 1;
      const search = debounce((text: any, sId: number) => {
        Resources.search(text).then((notes: IPrestoNote[]) => {
          if (sId === searchId) {
            scope.vm.state
              .force('Result', true, {
                notes: notes.map<INote>(note => ({
                  ...note,
                  content: extractLinesAroundMatch(note.content, text)
                }))
              })
              .set('Content', !!notes.length);
          }
        });
      }, 300);

      store.subscribe('app.searchText', text => {
        scope.vm.state.force('Initial', true, {notes: null, text});
        return text && search(text, ++searchId);
      }, scope);

      scope.$on('$destroy', () => store.dispatch(AppActions.search(null, 'user')));
    }
  }
});
