import {
  RequestMsgTypes,
  RQRSConstraint,
  RqtoRSConstraint,
  WorkerClient,
  WorkerRequestT,
  WorkerResponseData,
  WorkerResponseDataT,
} from '../types';

export {RequestTypeToResponseTypeMap, WorkerFunctionsMap} from '../types';

function XHRWorker(url, maxAge?): Promise<Worker> {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener('load', () => {
      const worker = new Worker(URL.createObjectURL(new Blob([oReq.responseText])));
      resolve(worker);
    });
    oReq.addEventListener('error', (e: any) => {
      reject(e.message);
    });
    oReq.open('get', url, true);
    if (maxAge) {
      oReq.setRequestHeader('Cache-Control', `max-age=${maxAge}`);
    }
    oReq.send();
  });
}
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export class TypedWorkerManager<
  RQ extends RQRSConstraint,
  RS extends RQRSConstraint,
  RQtoRS extends RqtoRSConstraint<RQ, RS>> {

  private requestId = 1;
  private readonly requestIdtoPromise = new Map<number, (value: WorkerResponseData<RQ, RS>) => void>();

  constructor(private readonly worker: WorkerClient<RQ, RS>) {
    this.worker.onmessage = e => {
      const response = e.data;
      const resolve = this.requestIdtoPromise.get(response.id);
      this.requestIdtoPromise.delete(response.id);

      if (!resolve) {
        throw new Error(`WorkerMngr:: Can't find promise, something horrible happend. id: ${response.id}`);
      }
      resolve(response.data);
    };
  }

  protected sendMsg<T extends RequestMsgTypes<RQ>>(msg: Omit<WorkerRequestT<RQ, RS, T>, 'id'>): Promise<WorkerResponseDataT<RQ, RS, T, RQtoRS>> {
    const sentMsg: WorkerRequestT<RQ, RS, T> = {...msg, id: this.requestId++};
    return new Promise(resolve => {
      this.requestIdtoPromise.set(sentMsg.id, resolve);
      this.worker.postMessage(sentMsg);
    });
  }

  static async createFromUrl<
    RQ extends RQRSConstraint,
    RS extends RQRSConstraint,
    RQtoRS extends RqtoRSConstraint<RQ, RS>,
    T extends TypedWorkerManager<RQ, RS, RQtoRS>>(this: new(w: WorkerClient<RQ, RS>) => T, url: string, maxAge = null) {

    const worker = await XHRWorker(url, maxAge);

    // tslint:disable-next-line: no-static-this
    return new this(worker);
  }
}
