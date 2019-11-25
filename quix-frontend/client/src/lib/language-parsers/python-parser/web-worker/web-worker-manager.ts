import {
  WorkerRequest,
  RequestToResponseMap,
  WorkerResponse
} from './types';
import {TypedWorkerManager} from '../../../web-worker-infra/web-worker-manager';

export class PythonWebWorkerMngr extends TypedWorkerManager<WorkerRequest, WorkerResponse, RequestToResponseMap> {
  getErrors(pythonCode: string) {
    return this.sendMsg({type: 'getErrors', data: pythonCode});
  }
}
