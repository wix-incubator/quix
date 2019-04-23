'use strict';
import {EventEmitter} from '../event-emitter/event-emitter';

function createSocket(self: Socket, url: string): any {
  const socket = new WebSocket(url);

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data || '{}');

    self.trigger('event', self, data.event, data);
  };

  socket.onopen = () => {
    self.trigger('open', self);
  };

  socket.onclose = () => {
    self.trigger('close', self);
  };

  return socket;
}

export class Socket extends EventEmitter {
  private readonly socket: any;

  constructor (private readonly url: string) {
    super();

    this.socket = createSocket(this, url);
  }

  send(payload): Socket {
    this.socket.send(JSON.stringify(payload));
    return this;
  }

  close(): Socket {
    this.socket.close();
    return this;
  }

  getUrl() {
    return this.url;
  }

  getWebSocket() {
    return this.socket;
  }
}
