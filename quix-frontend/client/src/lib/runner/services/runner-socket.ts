import {srv} from '../../core';
import {RunnerType} from '../typings/runner-types';

function attachProtocol(url: string) {
  return (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + url;
}

function getEndpoint(type: string, version: number) {
  return `/api/v${version}/execute/${type}`;
}

export class RunnerSocket extends srv.Socket {
  private readonly transformers = {
    response: response => response
  };

  constructor (
    type: RunnerType = 'sql',
    version: number = null,
    baseUrl = '',
    url: string = `${baseUrl}${getEndpoint(type, version)}`
  ) {
    super(attachProtocol(url));

    this.on('event', (socket, eventName = '__unknown__', data) => {
      this.fire(eventName, this.transformers.response(data), data.payload);
    });
  }

  public send(payload): RunnerSocket {
    super.send(payload);
    return this;
  }

  public transformResponse(transformer): RunnerSocket {
    this.transformers.response = transformer;
    return this;
  }
}
