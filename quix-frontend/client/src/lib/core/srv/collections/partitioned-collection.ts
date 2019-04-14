import {Collection, ModelCtor} from './collection';
import {lodash as _} from '../../utils';
import {injector} from '../injector';
import {IBaseModel} from '../model/model';
const inject = injector.get;

export class PartitionedCollection<T extends IBaseModel = any> extends Collection<T> {
  _chunkSize = 50;
  _offset = 0;
  _hasMore ;
  _optionalParams;

  private paramsTransformer = x => x;
  private requestStartHandler = x => x;
  private requestFinishHandler = x => x;

  static $q: ng.IQService;

  constructor(Model?: ModelCtor<T>, action = 'partitionedQuery') {
    super(Model, action);

    this._hasMore = true;
  }

  // PRIVATE
  _getParams() {
    const params = _.defaults({}, {
      offset: this._offset,
      total: this._chunkSize + 1
    }, this._optionalParams);

    return this.paramsTransformer(params);
  }

  _startRequestHook(deferred) {
    this.requestStartHandler(deferred);
  }

  _finishRequestHook(models) {
    this._hasMore = models.length > this._chunkSize;

    if (this._hasMore) {
      models.splice(-1, 1);
    }

    this._offset += models.length;

    this.requestFinishHandler(models);

    return models;
  }

  _more(params?) {
    return this._fetch(params).then(models => this.add(models));
  }

  // PUBLIC
  // methods
  setChunkSize(chunkSize) {
    this._chunkSize = chunkSize;
    return this;
  }

  getChunkSize() {
    return this._chunkSize;
  }

  fetch(optionalParams?) {
    this._offset = 0;
    this._optionalParams = optionalParams;

    return super.fetch(this._getParams());
  }

  more() {
    if (!this.hasMore()) {
      return this._resolveAsSelf(inject('$q').when());
    }

    return this._resolveAsSelf(this._more(this._getParams()));
  }

  hasMore() {
    return this._hasMore;
  }

  transformRequestParams(transformer) {
    this.paramsTransformer = transformer;
    return this;
  }

  onRequestStart(handler: (x) => any) {
    this.requestStartHandler = handler;
    return this;
  }

  onRequestFinish(handler: (x) => any) {
    this.requestFinishHandler = handler;
    return this;
  }
}
