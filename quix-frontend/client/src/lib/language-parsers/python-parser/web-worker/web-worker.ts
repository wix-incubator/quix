import {
  WorkerRequest,
  RequestToResponseMap,
  WorkerResponse,
  PythonWorkerFunctionsMap
} from './types';
import {getPythonErrors} from '../parser/index';
import {TypedWorkerFactory} from '../../../web-worker-infra/web-worker';

const functionMap: PythonWorkerFunctionsMap = {
  getErrors: getPythonErrors,
};

const pythonWorker =
  TypedWorkerFactory<WorkerRequest, WorkerResponse, RequestToResponseMap>(RequestToResponseMap, functionMap);

export default pythonWorker;
