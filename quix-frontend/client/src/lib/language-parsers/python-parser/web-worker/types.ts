import {WorkerFunctionsMap, RequestTypeToResponseTypeMap} from '../../../web-worker-infra/web-worker';
import {IErrorAnnotation} from '../parser/errors-listener';

export type WorkerRequest = {
  'getErrors': string;
};

export type WorkerResponse = {
  'errorsDone': IErrorAnnotation[];
};

export type RequestToResponseMap = {
  'getErrors': 'errorsDone';
};

export const RequestToResponseMap: WorkerRqstToResposneMapType = {
  getErrors: 'errorsDone'
};

export type WorkerRqstToResposneMapType =
  RequestTypeToResponseTypeMap<WorkerRequest, WorkerResponse, RequestToResponseMap>;

export type PythonWorkerFunctionsMap =
  WorkerFunctionsMap<WorkerRequest, WorkerResponse, RequestToResponseMap>;
