import {inject} from '../../core';

declare const gapi;

let myClientId = null;

const insertGoogleSdk = () => {
  insertScript('https://apis.google.com/js/platform.js');
};

const insertScript = file => {
  const po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = file;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
};

const authenticate = (prefix: string, code?: string) => {
  const url = (prefix ? '/' + prefix : '') + '/api/authenticate' + (code ? `?code=${code}` : '');
  return inject('$resource')(url).get().$promise;
};

export const config = (clientId) => {
  myClientId = clientId;
  insertGoogleSdk();
};

export const login = (prefix?: string) => {
  const deferred = inject('$q').defer();

  inject('$timeout')(() => {
    gapi.load('auth2', () => {
      const auth2 = gapi.auth2.init({
        client_id: myClientId,
        scope: 'email profile',
      });

      auth2.grantOfflineAccess().then(res => authenticate(prefix, res.code)
        .then(deferred.resolve)
        .catch(deferred.reject));
    });
  }, 1000);

  return deferred.promise;
};

export const logout = () => {
  (window as any).gapi.auth.signOut();
};
