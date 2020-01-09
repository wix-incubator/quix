import cookie from 'cookie';
import {ClientConfigHelper} from '@wix/quix-shared';
import {Store, sessionId} from '../lib/store';
import {App} from '../lib/app';

export const subscribeToStateChanges = (app: App<ClientConfigHelper>, store: Store) => {
  const ws = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}${app.getConfig().getClientTopology().apiBasePath}/subscription`);

  const {authCookieName} = app.getConfig().getAuth();
  const cookies = cookie.parse(document.cookie);
  const token = cookies[authCookieName];

  ws.onopen = () => {
    ws.onmessage = (message: MessageEvent) => {
      store.dispatch(JSON.parse(message.data).data);
    };

    ws.send(JSON.stringify({ event: 'subscribe', data: {token, sessionId} }));
  };
}
