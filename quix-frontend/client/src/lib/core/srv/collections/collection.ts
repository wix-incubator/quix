'use strict';

import {lodash as _} from '../../utils';
import {Model, IBaseModel} from '../model/model';
export type ModelCtor<T> = new (...args: any[]) => Model<T>;
export class Collection<T extends IBaseModel = any> {
  _Resource;
  _Model;
  _action;
  _models: (Model<T> | {data: T})[];
  _resolved;
  _promise;

  static Model;

  constructor(Mdl?: ModelCtor<T>, action = 'query') {
    this._Model = Mdl;
    this._action = action;
    this._models = [];
  }

  // PRIVATE
  // tslint:disable-next-line:no-empty
  _startRequestHook(deferred) {
    return deferred;
   }

  _finishRequestHook(models) {
    return models;
  }

  _getAction() {
    const action = (this._Resource || this._Model.Resource)[this._action];

    if (!action) {
      // tslint:disable-next-line: restrict-plus-operands
      throw new Error('Collection: resource is missing definition for "' + this._action + '" action');
    }

    return action;
  }

  _fetch(params) {
    const promise = this._startRequest(params);
    return this._finishRequest(promise);
  }

  _startRequest(params) {
    const action = this._getAction();
    const deferred = action(params);

    this._startRequestHook(deferred);
    this._resolved = false;

    return deferred.$promise;
  }

  _finishRequest(promise) {
    return promise
      .then(models => this._finishRequestHook(models))
      .finally(() => this._resolved = true);
  }

  _setModels(models: T | Model<T> | Model<T>[] | T[]) {
    this._models = [];
    this.add(models);
  }

  _resolveAsSelf(promise) {
    return (this._promise = promise.then(() => this));
  }

  // PUBLIC
  // getters
  get models() {
    return this._models;
  }

  get promise() {
    return this._promise;
  }

  get resolved() {
    return this._resolved;
  }

  // methods
  setResource(resource) {
    this._Resource = resource;
    return this;
  }

  size() {
    return this.models.length;
  }

  fetch(params?) {
    return this._resolveAsSelf(this._fetch(params).then(models => this._setModels(models)));
  }

  add(model: T | Model<T> | Model<T>[] | T[]) {
    let modelArray: any = (model instanceof Array ? model : [model]);

    if (this._Model) {
      modelArray = modelArray.map(mdl => mdl instanceof this._Model ? mdl : new this._Model(mdl));
    } else if (!(model instanceof Model)) {
      modelArray = modelArray.map(item => ({data: item}));
    }

    Array.prototype.push.apply(this._models, modelArray);

    return model instanceof Array ? modelArray : modelArray[0];
  }

  remove(model) {
    return _.remove(this._models, _model_ => _model_ === model)[0];
  }

  get(id) {
    return _.find(this.models, 'id', id);
  }

  has(id) {
    return !!this.get(id);
  }

  filter(what, value) {
    return _.filter(this.models, model => model.data[what] === value);
  }

  format() {
    return this.models.map(model => model instanceof Model ? model.format() : (model as any).data);
  }
}
