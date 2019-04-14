import {lodash as _, isPromise} from '../../utils';
type Dictionary<T> = Record<string, T>;
import {IStateClient} from './types';

export class State {
  private readonly clients: {[key: string]: IStateClient} = {};
  /* sometimes $destory is called only after another instance of a directive is loading
    so we save a queue of 1 "waiting" client */
  private readonly clientsOnHold: {[key: string]: IStateClient} = {};

  constructor (private readonly name: string, private doLoad: boolean | PromiseLike<boolean> = true) {
    if (isPromise(doLoad)) {
      (doLoad as PromiseLike<boolean>).then((value) => {
        this.doLoad = value;
      });
    }
  }

  getName() {
    return this.name;
  }

  getClientByName(name: string) {
    return this.clients[name];
  }

  /**
   * adds a new client to this state.
   * @param client
   * @returns {bi.core.srv.state.State}
   */
  register (client: IStateClient): State {
    const {name} = client;
    if (this.clients[name]) {
      console.error('State:register:: trying to register same name twice - ' + name);
      this.clientsOnHold[name] = client;
    } else {
      this.clients[name] = client;
    }
    return this;
  }

  unregister(name: string): State {
    if (this.clients[name]) {
      // tslint:disable-next-line: no-dynamic-delete
      delete this.clients[name];
      const waitingClient = this.clientsOnHold[name];
      if (waitingClient) {
        this.clients[name] = waitingClient;
        // tslint:disable-next-line: no-dynamic-delete
        delete this.clientsOnHold[name];
      }
    }
    return this;
  }

  private _export (providerName: string, clientList: string[]) {
    const res: Dictionary<Dictionary<string>> = {};

    if (clientList.length === 0) {
      clientList = Object.keys(this.clients);
    }
    _.forEach(clientList, (clientName: string) => {
      if (this.clients[clientName]) {
        const client = this.clients[clientName];
        res[client.name] = {};
        _.assign(res[client.name], client.exportFunc(providerName, this.name));
      }
    });
    return res;
  }

  exportAsJSON (providerName?: string, ...clientList: string[]) {
    return JSON.stringify(this._export(providerName, clientList));
  }

  //TODO: handle objects? in paramData
  exportAsURL (providerName?: string, ...clientList: string[]) {
    const data = this._export(providerName, clientList);
    const params = _.reduce(data, (outerResult, clientData, clientName) => {
      // tslint:disable-next-line: restrict-plus-operands
      return outerResult + _.reduce(clientData, (innerResult, paramData, paramName) => {
          return innerResult + `${clientName}-${paramName}:${paramData};`;
        }, '');
    }, '');
    return encodeURI(`&${this.name}-data=${params}`);
  }

  private _import (data: Object, clientList: string[]) {
    if (clientList.length === 0) {
      clientList = Object.keys(this.clients);
    }

    _.forEach(clientList, (clientName: string) => {
      if (this.clients[clientName]) {
        const client = this.clients[clientName];
        if (data[client.name]) {
          client.importFunc(data[client.name]);
        }
      }
    });
  }

  importFromJSON(stringData: string, ...clientList: string[]) {
    if (this.doLoad !== true) {
      return;
    }

    if (stringData) {
      this._import(JSON.parse(stringData), clientList);
    }
  }

  importFromURL(stringData: string, ...clientList: string[]) {
    if (this.doLoad !== true) {
      return;
    }
    // let match = new RegExp(`&?${this.name}-data=(.*)&?`).exec(stringData);
    // if (match && match[1]) {
    //   var stringDataStripStateName = match[1];
    // } else {
    //   throw new Error("State::importFromURL: Can't parse data!");
    // }

    if (!stringData) {
      return;
    }
    const data = {};
    const allParams = stringData.split(';');

    allParams.forEach( singleParamStr => {
      const [paramFullName, ...paramData] = singleParamStr.split(':');
      const path = paramFullName.replace('-', '.');
      _.set(data, path, paramData.join(':'));
    });
    this._import(data, clientList );
  }

}
