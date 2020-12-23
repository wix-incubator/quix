/* Constraints */
export interface RQRSConstraint {
  [key: string]: any;
}
export type RqtoRSConstraint<RQ, RS> = {[K in keyof RQ]: keyof RS};

/* Basic Types */
export type RequestMsgTypes<RQ> = keyof RQ; //all possible request types
export type ResponseMsgTypes<RS> = keyof RS; //all possible response types
export type AllMsgTypes<RQ, RS> = keyof RQ | keyof RS; //guess
export type RequestTypeToResponseTypeMap<RQ, RS, RQtoRs extends RqtoRSConstraint<RQ, RS>> = {
  [K in RequestMsgTypes<RQ>]: RQtoRs[K];
};

export type WorkerFunctionsMap<RQ, RS, RQtoRs extends RqtoRSConstraint<RQ, RS>> = {
  [K in RequestMsgTypes<RQ>]: (data: RQ[K]) => RS[RQtoRs[K]];
};

/**
 * Helper type for next types
 */
export interface WorkerMsgT<RQ, RS, T extends RequestMsgTypes<RQ> | ResponseMsgTypes<RS>> {
  id: number;
  type: T;
  data: (RS & RQ)[T];
}

/*
 * Bit of explanation for this ugliness:
 * We need both generic types, and union types.
 * We need union types because Map() an onMessage() must have a concrete type.
 */

//Union types
export type WorkerResponse<RQ, RS> = {
  [T in ResponseMsgTypes<RS>]: WorkerMsgT<RQ, RS, T>;
}[ResponseMsgTypes<RS>];

export type WorkerResponseData<RQ, RS> = RS[keyof RS];

export type WorkerRequest<RQ, RS> = {
  [T in RequestMsgTypes<RQ>]: WorkerMsgT<RQ, RS, T>;
}[RequestMsgTypes<RQ>];

//Generic types
export type WorkerResponseDataT<
  RQ,
  RS,
  T extends RequestMsgTypes<RQ>,
  RQtoRs extends RqtoRSConstraint<RQ, RS>
> = RS[RQtoRs[T]];

export type WorkerRequestT<RQ, RS, T extends RequestMsgTypes<RQ>> = WorkerMsgT<RQ, RS, T>;
export type WorkerResponseT<RQ, RS, T extends ResponseMsgTypes<RS>> = WorkerMsgT<RQ, RS, T>;

/* Worker types */
export interface WorkerClientMessageEvent<RQ, RS> extends MessageEvent {
  data: WorkerResponse<RQ, RS>;
}
export interface WorkerClient<RQ, RS> extends Worker {
  onmessage(e: WorkerClientMessageEvent<RQ, RS>): void;
  postMessage<T extends RequestMsgTypes<RQ>>(message: WorkerRequestT<RQ, RS, T>, transfer?: any[]): void;
  postMessage<T extends RequestMsgTypes<RQ>>(message: WorkerRequestT<RQ, RS, T>, options: {transfer: any[]}): void;
}

export interface WorkerMessageEvent<RQ, RS> extends MessageEvent {
  data: WorkerRequest<RQ, RS>;
}

export interface TypedWorker<RQ, RS> extends DedicatedWorkerGlobalScope {
  onmessage(e: WorkerMessageEvent<RQ, RS>): void;
  postMessage<T extends ResponseMsgTypes<RS>>(message: WorkerResponseT<RQ, RS, T>, transfer?: any[]): void;
  postMessage<T extends ResponseMsgTypes<RS>>(message: WorkerResponseT<RQ, RS, T>, options: {transfer: any[]}): void;
}
