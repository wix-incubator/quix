import template from './base.html';

import {ClientConfigHelper} from '@wix/quix-shared';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {setSearchText, setSearchPage} from '../../store/app/app-actions';
import {openSearchResults, closePopup, hasQueuedNotes, subscribeToStateChanges} from '../../services';

export default (app: App<ClientConfigHelper>, store: Store) => ({
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
    subscribeToStateChanges(app, store);

    store.subscribe('app.searchText', text => text ? openSearchResults(scope) : closePopup(), scope);

    window.onbeforeunload = () => hasQueuedNotes(store) || undefined;
  },
  link: (scope) => {

  }
}) as IStateComponentConfig;
