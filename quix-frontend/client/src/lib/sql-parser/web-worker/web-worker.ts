import * as tokenizer from '../tokenizer';
import {
  SqlRequest,
  RequestToResponseMap,
  SqlResponse,
  SqlWorkerFunctionsMap
} from './types';
import {getErrorsPrestoSql, parsePrestoSql} from '../parser/index';
import {TypedWorkerFactory} from '../../web-worker-infra/web-worker';
import {formatSql} from '../auto-format';

const functionMap: SqlWorkerFunctionsMap = {
  getErrors: getErrorsPrestoSql,
  parse: parsePrestoSql,
  getIdentifiers: (query) => {
    const tokens = tokenizer.tokenize(query);
    return tokenizer.getIdentifiers(tokens);
  },
  autoFormat: (query) => formatSql(query)
};

const sqlWorker =
  TypedWorkerFactory<SqlRequest, SqlResponse, RequestToResponseMap>(RequestToResponseMap, functionMap);

export default sqlWorker;
