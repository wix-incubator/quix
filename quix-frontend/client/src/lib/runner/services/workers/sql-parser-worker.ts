import {BiSqlWebWorkerMngr} from '../../../language-parsers/sql-parser';

const workerUrl = 'https://static.parastorage.com/unpkg/@wix/bi-sql-parser@1.0.43/dist/statics/web-worker.bundle.min.js';
let sqlParserPromise: Promise<BiSqlWebWorkerMngr>;

export const initSqlWorker = async (): Promise<BiSqlWebWorkerMngr | null> => {
  sqlParserPromise = sqlParserPromise || BiSqlWebWorkerMngr.createFromUrl(workerUrl, 86400);
  return sqlParserPromise;
};
