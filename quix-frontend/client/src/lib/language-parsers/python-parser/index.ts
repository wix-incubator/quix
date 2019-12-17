import {PythonWebWorkerMngr} from './web-worker/web-worker-manager';
export {PythonWebWorkerMngr};

declare var window: any;
if (typeof window !== 'undefined') {
  window.biPythonParser = {PythonWebWorkerMngr};
}
