import {BiSqlWebWorkerMngr} from './web-worker/web-worker-manager';
export {BiSqlWebWorkerMngrCtor, BiSqlWebWorkerMngr} from './web-worker/web-worker-manager';

declare var window: any;
if (typeof window !== 'undefined') {
  window.biSqlParser = {BiSqlWebWorkerMngr};
}
