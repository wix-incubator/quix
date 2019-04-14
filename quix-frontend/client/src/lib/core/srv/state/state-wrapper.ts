'use strict';
import {State} from './state';
import {IStateClient, IStateProvider} from './types';
import {urlStateProvider} from './url-state-provider';
import {localStorageStateProvider} from './localstorage-state-provider';
import {lodash as _, isPromise} from '../../utils';

/**
 * Core services
 *
 * @author Our One Creator Which Flies and is Spaghetti and a Monster
 */

const IOProviders = {
  localStorage: {
    provider: localStorageStateProvider,
    dataType: 'JSON'
  },
  url: {
    provider: urlStateProvider,
    dataType: 'URL'
  }
};

export type traverseFunction = (obj: any, callback: (obj: any, args: any[]) => void, args: any[], deep?: boolean) => void;
function defaultTraverse(obj: any, callback, args: any[] = [], deep = true) {
  callback(obj, args);
  if (deep) {
    _.forOwn(obj, (child, childName) => {
      if (_.isObject(child) && child !== obj) {
        defaultTraverse(child, callback, args, deep);
      }
    });
  }
}

function createLoadFunction(obj: any, deep = true, oneTimeLoad = false, customTraverse?) {
  const traverse = customTraverse ? customTraverse : defaultTraverse;

  const loadFunction = function (ob: any, args: any[] = []) {
    if (oneTimeLoad && ob.$stateLoaded) {
      return;
    }
    if (_.isFunction(ob.$import)) {
      ob.$import(...args);
    }
    if (oneTimeLoad) {
      ob.$stateLoaded = true;
    }
  };
  return function (params) {
    traverse(obj, loadFunction, [params], deep);
  };
}

function createSaveFunction(obj: Object, deep = true, customTraverse?): (providerName: string, stateName: any) => any {
  const traverse = customTraverse ? customTraverse : defaultTraverse;

  const saveFunction = function (providerName: string, accumulator, ob: any, args: any[] = []) {
    if (_.isFunction(ob.$export)) {
      _.assign(accumulator, ob.$export(providerName, ...args));
    }
  };

  return function (providerName: string, stateName) {
    const accumulator = {};
    traverse(obj, saveFunction.bind(null, providerName, accumulator), [stateName], deep);
    return accumulator;
  };
}

export interface StateWrapperOptions {
  doClientLoad?: PromiseLike<boolean> | boolean;
  doGlobalLoad?: PromiseLike<boolean> | boolean;
  deep?: boolean;
  oneTimeLoad?: boolean;
}

export class StateWrapperBuilder {
  private object: Object;
  private clientName: string;
  private state: StateWrapper;
  private options: StateWrapperOptions = {
    doClientLoad: true,
    doGlobalLoad: true,
    deep: true,
    oneTimeLoad: false
  };
  private providers: string[];
  private newStateName: string;
  private traverse: traverseFunction;

  useObject(object) {
    this.object = object;
    return this;
  }

  setClientName(name) {
    this.clientName = name;
    return this;
  }

  withOptions(options: StateWrapperOptions) {
    this.options = _.assign(this.options, options);
    return this;
  }

  withState(state: StateWrapper) {
    this.state = state;
    return this;
  }

  withNewState(name: string) {
    this.newStateName = name;
    return this;
  }

  withProviders(providers: string[]) {
    this.providers = providers;
    return this;
  }

  withCustomTraverse(traverseFunc: traverseFunction) {
    this.traverse = traverseFunc;
    return this;
  }

  private verifyMandatoryParametrs() {
    if (!this.object) {
      throw new Error('StateWrapperBuilder::build: You must provide an object');
    }
    if (!this.clientName) {
      throw new Error('StateWrapperBuilder::build: You must provide a clientName');
    }
    if (!this.state && !this.newStateName) {
      throw new Error('StateWrapperBuilder::build: You must provide a state');
    }
  }

  public end() {
    this.verifyMandatoryParametrs();

    const {doClientLoad, doGlobalLoad, deep, oneTimeLoad} = this.options;
    let baseState;

    if (!this.providers) {
      this.providers = ['localStorage', 'url'];
    }

    if (this.state) {
      baseState = this.state.getBaseState();
    } else {
      baseState = new State(this.newStateName, doGlobalLoad);
    }
    const stateWrapper = new StateWrapper(baseState, this.clientName, this.providers);
    const stateClient: IStateClient = {
      name: this.clientName,
      importFunc: createLoadFunction(this.object, deep, oneTimeLoad, this.traverse),
      exportFunc: createSaveFunction(this.object, deep, this.traverse)
    };

    baseState.register(stateClient);

    if (doClientLoad === true) {
      stateWrapper.load();
    } else if (isPromise(doClientLoad)) {
      (doClientLoad as PromiseLike<boolean>).then(() => {
        stateWrapper.load();
      });
    }

    return stateWrapper;
  }
}

export class StateWrapper {
  private readonly inputOutputProviders: {name: string; provider: IStateProvider; dataType: string}[] = [];

  static build() {
    return new StateWrapperBuilder();
  }

  constructor(private readonly state: State, private readonly clientName, providers = ['localStorage', 'url']) {
    providers.forEach((providerName) => {
      if (IOProviders[providerName]) {
        this.inputOutputProviders.push({name: providerName, ...IOProviders[providerName]});
      }
    });
  }

  getBaseState() {
    return this.state;
  }

  private _load(clientList: string[] = []) {
    const stateName = this.state.getName();
    this.inputOutputProviders.forEach(providerInfo => {
      const data = providerInfo.provider.getStateData(stateName);
      const functionName = 'importFrom' + providerInfo.dataType;
      this.state[functionName](data, ...clientList);
    });
  }

  load(...clientList) {
    if (clientList.length === 0) {
      clientList = [this.clientName];
    }
    this._load(clientList);
  }

  loadAll() {
    this._load([]);
  }

  private _save(clientList: string[] = []) {
    const stateName = this.state.getName();
    this.inputOutputProviders.forEach(providerInfo => {
      const functionName = 'exportAs' + providerInfo.dataType;
      const data = this.state[functionName](providerInfo.name, ...clientList);
      providerInfo.provider.setStateData(stateName, data);
    });
  }

  save(...clientList) {
    if (clientList.length === 0) {
      clientList = [this.clientName];
    }
    this._save(clientList);
  }

  saveAll() {
    this._save([]);
  }

  unregister() {
    this.state.unregister(this.clientName);
  }
}
