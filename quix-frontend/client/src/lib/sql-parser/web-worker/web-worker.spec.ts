import {expect} from 'chai';

import Worker from 'tiny-worker';
import {BiSqlWebWorkerMngr} from './web-worker-manager';

function webWorkerFunc() {
  require('ts-node/register');
  const webWorker = require(process.cwd() + '/src/lib/sql-parser/web-worker/web-worker.ts').default;
  webWorker(self);
}

describe('web worker', () => {
  let worker: Worker;
  let workerMngr: BiSqlWebWorkerMngr;

  beforeEach(() => {
    worker = new Worker(webWorkerFunc as any);
    workerMngr = new BiSqlWebWorkerMngr(worker);
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should communicate with web worker', () => {
    return workerMngr.getIdentifiers(`select foo,bar from table111 where foo = 'value'`)
      .then(identifersAndStrings => {
        expect(identifersAndStrings.identifiers).to.eql(['foo', 'bar', 'table111']);
        expect(identifersAndStrings.strings).to.eql([`'value'`]);
      }).catch(e => expect.fail(e));
  });

  it('should auto format code', () => {
    return workerMngr.autoFormat(`select col1,col2,col3 from table where col1=value limit 100`)
      .then(result => {
        expect(result).to.eql(`select
  col1,
  col2,
  col3
from
  table
where
  col1 = value
limit
  100`);
      });
  });
});
