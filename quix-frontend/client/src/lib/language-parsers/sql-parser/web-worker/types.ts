import {WorkerFunctionsMap, RequestTypeToResponseTypeMap} from '../../../web-worker-infra/web-worker';
import {IErrorAnnotation} from '../parser/errors-listener';

export interface SqlRequest {
  'getIdentifiers': string,
  'parse': string;
  'getErrors': string;
  'autoFormat': string;
}

export interface SqlResponse {
  'getIdentifiersDone': {identifiers: string[]; strings: string[]};
  'parseDone': {strings: string[]; tables: string[]; subQueries: string[]; columns: string[]};
  'errorsDone': IErrorAnnotation[];
  'autoFormatDone': string;
}

export interface RequestToResponseMap {
  'getIdentifiers': 'getIdentifiersDone';
  'parse': 'parseDone';
  'getErrors': 'errorsDone';
  'autoFormat': 'autoFormatDone';
}

export const RequestToResponseMap: SqlRqstToResposneMapType = {
  getIdentifiers: 'getIdentifiersDone',
  parse: 'parseDone',
  getErrors: 'errorsDone',
  autoFormat: 'autoFormatDone'
};

export type SqlRqstToResposneMapType =
  RequestTypeToResponseTypeMap<SqlRequest, SqlResponse, RequestToResponseMap>;

export type SqlWorkerFunctionsMap =
  WorkerFunctionsMap<SqlRequest, SqlResponse, RequestToResponseMap>;
