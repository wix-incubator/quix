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

const authenticate = (apiBasePath: string, code?: string) => {
  const url = (apiBasePath ? apiBasePath : '') + '/api/authenticate' + (code ? `?code=${code}` : '');
  return inject('$resource')(url).get().$promise;
};

export const init = () => {
  return insertGoogleSdk();
};

export const login = async (clientId, apiBasePath?: string): Promise<any> => {
  await init();

  const deferred = inject('$q').defer();

  $(() => gapi.load('auth2', () => {
    try {
      const auth2 = gapi.auth2.init({
        client_id: clientId,
        scope: 'email profile',
      });

      auth2.grantOfflineAccess().then(res => authenticate(apiBasePath, res.code)
        .then(deferred.resolve)
        .catch(deferred.reject));
    } catch(e) {
      console.error(e);
      deferred.reject(e);
    }
  }));

  return deferred.promise;
};

export const logout = () => {
  (window as any).gapi.auth.signOut();
};
