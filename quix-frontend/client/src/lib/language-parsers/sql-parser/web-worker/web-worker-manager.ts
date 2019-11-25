import {
  SqlRequest,
  RequestToResponseMap,
  SqlResponse
} from './types';
import {TypedWorkerManager} from '../../../web-worker-infra/web-worker-manager';

export type BiSqlWebWorkerMngrCtor = typeof BiSqlWebWorkerMngr;

export class BiSqlWebWorkerMngr extends TypedWorkerManager<SqlRequest, SqlResponse, RequestToResponseMap> {

  getIdentifiers(sqlQuery: string) {
    return this.sendMsg({type: 'getIdentifiers', data: sqlQuery});
  }

  getErrors(sqlQuery: string) {
    return this.sendMsg({type: 'getErrors', data: sqlQuery});
  }

  parse(sqlQuery: string) {
    return this.sendMsg({type: 'parse', data: sqlQuery});
  }

  autoFormat(sqlQuery: string) {
    return this.sendMsg({type: 'autoFormat', data: sqlQuery});
  }
}
