import {expect} from 'chai';
import Worker = require('tiny-worker');

import {RequestTypeToResponseTypeMap} from './types';
import {TypedWorkerFactory} from './web-worker';
import {TypedWorkerManager} from './web-worker-manager';

declare var __dirname: any;
type Requests = {
  'action1': string
};

type Responses = {
  'action1Done': string
};

type RequestToResponse = {
  'action1': 'action1Done'
};

const RequestToResponse: RequestTypeToResponseTypeMap<Requests, Responses, RequestToResponse> = {
  action1: 'action1Done'
};

function webWorkerFunc() {
  require('ts-node/register');
  const webWorkerFactory: typeof TypedWorkerFactory = require(__dirname + '/src/web-worker.ts').TypedWorkerFactory;
  const webWorker = webWorkerFactory(RequestToResponse, {action1: (data) => data + '!'});
  webWorker(this);   /* tslint:disable-line:no-invalid-this */
}

describe('web worker', () => {
  class DemoWorkerManager extends TypedWorkerManager<Requests, Responses, RequestToResponse> {
    echoWithExclemation(s: string) {
      return this.sendMsg({type: 'action1', data: s});
    }
  }
  let worker: Worker;
  let workerMngr: DemoWorkerManager;

  beforeEach(() => {
    worker = new Worker(webWorkerFunc as any);
    workerMngr = new DemoWorkerManager(worker);
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should communicate with web worker', () => {
    workerMngr.echoWithExclemation('Hi')
      .then(returnString => {
        expect(returnString).to.eql('Hi!');
      });
  });
});
