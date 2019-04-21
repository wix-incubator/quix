import template from './base.html';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {search} from '../../store/app/app-actions'
import {openPopup, closePopup} from '../../services/popup';

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

    store.subscribe('app.searchText', text => {
      if (!text) {
        closePopup();
        return;
      }

      openPopup(`
        <quix-search-results class="bi-c-h bi-grow"></quix-search-results>
      `, scope)((_, element) => element.addClass('quix-search-popup'));
    }, scope);
  },
  link: (scope) => {
    initNgScope(scope)
      .withEvents({
        onTempNoteClick() {
          openPopup(`<quix-temp-query class="bi-c-h bi-grow"></quix-temp-query>`, scope);
        }
      });
  }
}) as IStateComponentConfig;
