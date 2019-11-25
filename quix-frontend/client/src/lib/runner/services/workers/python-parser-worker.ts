import {PythonWebWorkerMngr} from '../../../language-parsers/python-parser';

const workerUrl = 'https://static.parastorage.com/unpkg-semver/bi-python-parser/web-worker.bundle.js';
let pythonParserPromise: Promise<PythonWebWorkerMngr>;

export const initPythonWorker = async (): Promise<PythonWebWorkerMngr | null> => {
  pythonParserPromise = pythonParserPromise || PythonWebWorkerMngr.createFromUrl(workerUrl, 86400);
  return pythonParserPromise;
};
