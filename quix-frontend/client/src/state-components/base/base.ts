import template from './base.html';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {setSearchText, setSearchPage} from '../../store/app/app-actions';
import {openSearchResults, openTempQuery, closePopup, hasQueuedNotes} from '../../services';

export default (app: App, store: Store) => ({
  name: '',
  abstract: true,
  template,
  url: {
    searchText: setSearchText,
    searchPage: page => setSearchPage(page && parseInt(page, 10))
  },
  scope: {},
  controller: (scope, params, {syncUrl}) => {
    syncUrl();

    store.subscribe('app.searchText', text => text ? openSearchResults(scope) : closePopup(), scope);

    window.onbeforeunload = () => hasQueuedNotes(store) || undefined;
  },
  link: (scope) => {
    initNgScope(scope)
      .withEvents({
        onTempNoteClick() {
          openTempQuery(scope);
        }
      });
  }
}) as IStateComponentConfig;
