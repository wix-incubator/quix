import {inject} from '../../core';

declare const gapi;

const insertScript = file => {
  const deferred = inject('$q').defer();

  const po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = file;
  po.onload = () => deferred.resolve();

  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);

  return deferred.promise;
};

const insertGoogleSdk = () => {
  return insertScript('https://apis.google.com/js/platform.js');
};

const authenticate = (prefix: string, code?: string) => {
  const url = (prefix ? prefix : '') + '/api/authenticate' + (code ? `?code=${code}` : '');
  return inject('$resource')(url).get().$promise;
};

export const init = () => {
  return insertGoogleSdk();
};

export const login = async (clientId, prefix?: string) => {
  await init();

  const deferred = inject('$q').defer();

  $(() => gapi.load('auth2', () => {
    const auth2 = gapi.auth2.init({
      client_id: clientId,
      scope: 'email profile',
    });

    auth2.grantOfflineAccess().then(res => authenticate(prefix, res.code)
      .then(deferred.resolve)
      .catch(deferred.reject));
  }));

  return deferred.promise;
};

export const logout = () => {
  (window as any).gapi.auth.signOut();
};
