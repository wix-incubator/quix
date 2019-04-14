'use strict';

import {lodash as _} from '../../utils';
import {injector} from '../injector';

function processParam(moduleName: string, paramName: string, paramValue: string | boolean) {
  let paramNameWithPrefix = moduleName + '-' + paramName;
  if (paramValue === true) {
    return paramNameWithPrefix + '&';
  } else if (paramValue === false) {
    return '';
  } else {
    return paramNameWithPrefix + '=' + paramValue + '&';
  }
}

export type decodeFunc = (input: {}) => any;
export type encodeFunc = () => {[key: string]: string | boolean};

export interface ModuleCallbacks {
  encode: encodeFunc;
  decode: decodeFunc;
}

export class UrlParams {
  modules = {};
  private $location: ng.ILocationService;

  constructor() {
    this.$location = injector.get('$location');
  }

  register(moduleName: string, decode: decodeFunc, encode: encodeFunc) {
    if (moduleName.search('\-') !== -1) {
      throw new Error('urlParams: can\'t register module name with a dash: ' + moduleName);
    }
    if (this.modules[moduleName]) {
      throw new Error('urlParams: registered two modules with same prefix: ' + moduleName);
    }

    this.modules[moduleName] = {decode, encode};
    return {
      decode: () => {
        return this.decode([moduleName]);
      },
      generateURL: this.generateURL.bind(this, [moduleName]),
      unregister: () => {
        if (this.modules[moduleName]) {
          delete this.modules[moduleName];
        }
      }
    };
  }

  public generateURL(moduleList: Array<string> = null) {
    let res = '';
    _.forEach(this.modules, (cb: ModuleCallbacks, moduleName) => {
      if (moduleList && ! _.includes(moduleList, moduleName)) {
        return;
      }
      let moduleParams = cb.encode();
      _.forEach(moduleParams, (paramValue, paramName) => {
        res += processParam(moduleName, paramName, paramValue);
      });
    });
    return res.slice(0, -1);
  }

  public decode(moduleList: Array<string> = null) {
    let map = this._sperateParamsByModule();
    _.forEach(this.modules, (cb: ModuleCallbacks, moduleName) => {
      if (moduleList && ! _.includes(moduleList, moduleName)) {
        return;
      }
      cb.decode(map[moduleName]);
    });
  }

  private _sperateParamsByModule() {
    let res = {};
    let urlMap = this.$location.search();
    _.forEach(urlMap, (value, key: string) => {
      let [moduleName] = key.split('-', 1);
      if (this.modules[moduleName]) {
        let path = key.replace('-', '.');
        _.set(res, path, value);
      }
    });
    return res;
  }
}
