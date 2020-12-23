import {
  TypedWorker,
  RQRSConstraint,
  RqtoRSConstraint,
  WorkerFunctionsMap,
  RequestMsgTypes,
  WorkerRequestT,
  RequestTypeToResponseTypeMap,
} from '../types';
export {TypedWorker, RequestTypeToResponseTypeMap, WorkerFunctionsMap} from '../types';

export function TypedWorkerFactory<
  RQ extends RQRSConstraint,
  RS extends RQRSConstraint,
  RQtoRs extends RqtoRSConstraint<RQ, RS>
>(msgTypeMapping: RequestTypeToResponseTypeMap<RQ, RS, RQtoRs>, functionsMap: WorkerFunctionsMap<RQ, RS, RQtoRs>) {
  return (self: TypedWorker<RQ, RS>) => {
    self.onmessage = e => {
      try {
        handleMsg(e.data);
      } catch (e) {
        console.error('something bad happened', e);
      }
    };

    function handleMsg<T extends RequestMsgTypes<RQ>>(req: WorkerRequestT<RQ, RS, T>) {
      const {data} = req;
      const responseType = msgTypeMapping[req.type];
      const responseData = functionsMap[req.type](data);
      const response = {
        id: req.id,
        type: responseType,
        data: responseData,
      } as any;

      self.postMessage(response);
    }
  };
}
