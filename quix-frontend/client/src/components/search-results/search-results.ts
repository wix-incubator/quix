import template from './search-results.html';
import './search-results.scss';
import 'highlight.js/styles/tomorrow.css';

import {assign, debounce} from 'lodash';
import hljs from 'highlight.js';
import {initNgScope, inject} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {INote} from '@wix/quix-shared';
import {IScope} from './search-results-types';
import * as Resources from '../../services/resources';
import * as AppActions from '../../store/app/app-actions';
import {StateManager, extractLinesAroundMatch} from '../../services';
import {paramSerializerFactory} from '../../lib/code-editor';
import {Search} from '../../config';

enum States {
  Initial,
  Error,
  Result,
  Content,
  LoadingPage,
}

const initPagination = (scope: IScope, totalResults: number, currentPage: number) => {
  const totalPages = Math.ceil(totalResults / Search.ResultsPerPage);

  const leftEdgePages = Math.min(
    Math.max(0, totalPages - Search.PaginationMiddlePages),
    Search.PaginationEdgePages
  );

  const rightEdgePages = Math.min(
    Math.max(0, totalPages - Search.PaginationEdgePages - Search.PaginationMiddlePages),
    Search.PaginationEdgePages
  );

  const middlePages = Math.min(totalPages, Search.PaginationMiddlePages);

  const middleLeftBoundary = Math.min(
    Math.max(
      leftEdgePages,
      currentPage - Math.round(Search.PaginationMiddlePages / 2)
    ),
    Math.max(0, totalPages - Search.PaginationMiddlePages - rightEdgePages)
  );

  scope.vm.pages = [
    ...[...(Array(leftEdgePages).keys())].map(i => i + 1),
    ...[...(Array(middlePages).keys())].map(i => i + 1 + middleLeftBoundary),
    ...[...(Array(rightEdgePages).keys())].map(i => i + 1 + totalPages - rightEdgePages),
  ];

  scope.vm.currentResults = Math.min(currentPage * Search.ResultsPerPage, totalResults);
  scope.vm.totalPages = totalPages;

  scope.vm.state.value({currentPage: Math.min(totalPages, currentPage)});
}

const initResults = (text: string, notes: INote[]) => {
  const serializer = paramSerializerFactory('sql');

  return notes.map<INote>(note => ({
    ...note,
    content: extractLinesAroundMatch(serializer.removeEmbed(note.content), text)
  }));
}

const search = ((currentSearchId = 1) => debounce((scope: IScope, store: Store, text: string, page: number) => {
  const searchId = ++currentSearchId;

  if (!text) {
    return store.dispatch(AppActions.setSearchText(null, 'user'));
  }

  return Resources.search(text, (page - 1) * Search.ResultsPerPage, Search.ResultsPerPage)
    .then(({notes, count}: {notes: INote[]; count: number}) => {
      if (searchId === currentSearchId) {
        scope.vm.state
          .force('Result', true, {
            totalResults: count,
            notes: initResults(text, notes)
          })
          .set('Content', !!notes.length);

        initPagination(scope, scope.vm.state.value().totalResults, scope.vm.state.value().currentPage);
      }
    })
    .catch(e => {
      if (searchId === currentSearchId) {
        scope.vm.state.force('Error', true, {error: {...e.data, status: e.status}});
      }
    })
    .then(() => store.dispatch(AppActions.setSearchText(text, 'user')));
}, 300))();

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          pages: null,
          totalPages: 1,
          currentResults: 1,
          $init() {
            this.state = new StateManager(States);
          }
        })
        .withEvents({
          onNoteClick(note: INote) {
            app.go('notebook', {id: note.notebookId, note: note.id});
          },
          onPageSelect(page: number) {
            store.dispatch(AppActions.setSearchPage(page, 'user'));
          }
        });

      store.subscribe('app.searchText', text => {
        scope.vm.state.force('Initial', true, {text, currentPage: 1});

        return search(scope, store, text, scope.vm.state.value().currentPage);
      }, scope);

      store.subscribe('app.searchPage', page => {
        if (page) {
          scope.vm.state
            .set('LoadingPage', scope.vm.state.after('Result'), {currentPage: page})
            .else(() => scope.vm.state.value({currentPage: page}));

          search(scope, store, scope.vm.state.value().text, page);
        }
      }, scope);


      scope.renderNoteContent = (note: INote) => ({
        html: inject('$compile')(`
          <div ng-bind-html="html | biHighlight:vm.state.value().text"></div>
        `)(assign(scope.$new(), {
          html: hljs.highlight('sql', note.content).value
        }))
      });

      scope.$on('$destroy', () => store.dispatch([
        AppActions.setSearchPage(null, 'user'),
        AppActions.setSearchText(null, 'user')
      ]));
    }
  }
});
