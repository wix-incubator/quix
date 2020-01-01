import template from './base.html';

import {Store, sessionId} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {setSearchText, setSearchPage} from '../../store/app/app-actions';
import {openSearchResults, closePopup, hasQueuedNotes} from '../../services';

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

    const ws = new WebSocket('ws://localhost:3000');
    
    const token = undefined;
    ws.onopen = () => {
      ws.onmessage = (message: MessageEvent) => {
        store.dispatch(JSON.parse(message.data).data)
      };
      ws.send(JSON.stringify({ event: 'subscribe', data: {token, sessionId} }));
    };

    store.subscribe('app.searchText', text => text ? openSearchResults(scope) : closePopup(), scope);

    window.onbeforeunload = () => hasQueuedNotes(store) || undefined;
  },
  link: (scope) => {

  }
}) as IStateComponentConfig;
