'use strict';
import {PartitionedCollection} from './partitioned-collection';
import {injector} from '../injector';
import {IBaseModel, Model} from '../model/model';
import {ModelCtor} from './collection';
const inject = injector.get;

export class BufferedCollection<T extends IBaseModel = any>  extends PartitionedCollection<T> {
  _buffer: T[] | Model<T>[] = [];
  _hasMore = true;
  _isSealed = false;
  _deferred;

  constructor(Mdl?: ModelCtor<T>) {
    super(Mdl);
  }

  // PRIVATE
  _getAction() {
    return () => {
      const deferred = inject('$q').defer();
      deferred.$promise = deferred.promise;

      return deferred;
    };
  }

  _startRequestHook(deferred) {
    this._deferred = deferred;
  }

  _finishRequestHook(models) {
    this._deferred = null;

    return models;
  }

  _getNextChunk() {
    const offset = this.size();

    return this._buffer.slice(offset, offset + this._chunkSize);
  }

  _resolveNextChunk() {
    this._deferred.resolve(this._getNextChunk());
  }

  _isNextChunkReady() {
    return this.bufferSize() - this.size() >= this._chunkSize;
  }

  _isRequestPending() {
    return !!this._deferred;
  }

  // PUBLIC
  // getters
  get buffer() {
    return this._buffer;
  }

  // methods
  isSealed() {
    return this._isSealed;
  }

  hasMore() {
    return this._buffer.length - this.models.length > 0;
  }

  bufferSize() {
    return this._buffer.length;
  }

  fetch() {
    this._buffer = [];
    this._models = [];
    this._deferred = null;
    this._isSealed = false;

    return super.fetch();
  }

  more() {
    if (this._isSealed && !this.hasMore()) {
      return this._resolveAsSelf(inject('$q').when());
    }  {
      const promise = this._more();

      if (this.hasMore()) {
        this._resolveNextChunk();
      }

      return this._resolveAsSelf(promise);
    }
  }

  feed(models: T | Model<T> | T[] | Model<T>[]) {
    this._buffer.push.apply(this._buffer, models instanceof Array ? models : [models]);

    if (this._isRequestPending() && this._isNextChunkReady()) {
      this._resolveNextChunk();
    }

    return this;
  }

  seal() {
    this.flush();
    this._isSealed = true;

    return this;
  }

  rewind() {
    this._models = [];
    return this;
  }

  flush() {
    if (this._isRequestPending()) {
      this._resolveNextChunk();
    }
  }
}
