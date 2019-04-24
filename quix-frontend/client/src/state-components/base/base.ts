import template from './base.html';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {search} from '../../store/app/app-actions';
import {openSearchResults, openTempQuery, closePopup} from '../../services';

export default (app: App, store: Store) => ({
  name: 'base',
  abstract: true,
  template,
  url: {
    searchText: text => search(text)
  },
  scope: {},
  controller: (scope, params, {syncUrl}) => {
    syncUrl();

    store.subscribe('app.searchText', text => text ? openSearchResults(scope) : closePopup());
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
