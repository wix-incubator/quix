'use strict';
import {Collection} from '../collections/collection';
import {lodash as _, uuid} from '../../utils';
import {injector} from '../injector';
const inject = injector.get;

function flatten(data, keys = [], res = {}) {
  _.forEach(data, (value, key) => {
    keys.push(key);

    if (_.isObject(value)) {
      flatten(value, keys, res);
    } else {
      res[keys.join('.')] = value;
    }

    keys.pop();
  });

  return res;
}

function unflatten(data, keys = []) {
  const res = {};

  _.forEach(data, (value, key) => {
    unflattenKey(key.split('.'), value, res);
  });

  return res;
}

function unflattenKey(keys, value, res = {}) {
  const key = keys.shift();

  if (!keys.length) {
    res[key] = value;
  } else {
    res[key] = res[key] || {};
    unflattenKey(keys, value, res[key]);
  }
}

export interface IBaseModel {
  id?: string;
  owner?: {
    email: string;
  };
}
export class Model<T extends IBaseModel = any> {
  _template;
  _resolved;
  _valid;
  _meta;
  _options;

  _cid;
  _data: T;
  _promise;
  _permission;
  _Resource;

  constructor(model?, template?, options = {autoId: false, autoOwner: null}) {
    this._template = template || {};
    this._resolved = !!model;
    this._valid = true;
    this._meta = {};
    this._options = options;

    this._data = this.parse(model);
    this._promise = inject('$q').when(this);

    if (options.autoId && !this.data.id) {
      this._assignId();
    } else {
      this._cid = _.uniqueId('new');
    }

    if (options.autoOwner && !(this.data.owner && this.data.owner.email)) {
      this._assignAutoOwner();
    }
  }

  // PRIVATE
  _responseHook(data, action, options) {
    return data;
  }

  _assignId() {
    this._cid = this.data.id = uuid();

    return this;
  }

  _doRequest(action, data) {
    this._resolved = false;
    return this._Resource[action](data).$promise;
  }

  _processResponse(promise, action) {
    return (this._promise = promise.then((data) => {
      if (!this._promise._noSync) {
        data = this._smartMerge(this._data, this.parse(data));
        data = typeof this._responseHook === 'function' ? this._responseHook(data, action, {noSync: false}) : data;

        this._data = data;

        if (action === 'clone') {
          if (this._options.autoId) {
            this._assignId();
          }

          if (this._options.autoOwner) {
            this._assignAutoOwner();
          }
        }
      } else if (typeof this._responseHook === 'function') {
        this._responseHook(this.parse(data), action, {noSync: true});
      }

      if ((action === 'get' || action === 'save') && this._options.autoId) {
        this._cid = _.uniqueId('new');
      }

      return this;
    }).finally(() => {
      this._resolved = true;
    }));
  }

  _action(action, data?) {
    if (!data) {
      data = this.format();
    }

    const promise = this._processResponse(this._doRequest(action, data), action);
    this._initPromise(promise);

    return promise;
  }

  _initPromise(promise) {
    promise.noSync = () => {
      promise._noSync = true;
      return promise;
    };

    return promise;
  }

  _assignAutoOwner() {
    const user = inject('user');
    this._data.owner = _.clone(user.data);
  }

  _stripDollars(data: any) {
    if (_.isPlainObject(data)) {
      // tslint:disable-next-line: restrict-plus-operands
      data = _.omit(data, (value, key) => ('' + key).charAt(0) === '$');
      data = _.mapValues(data, value => this._stripDollars(value));
    }

    if (_.isArray(data)) {
      data = data.map(item => this._stripDollars(item));
    }

    return data;
  }

  _parseCollection(collectionString, data) {
    const collectionClassName = collectionString.replace('@collection:', '');
    const CollectionClass = inject(collectionClassName);

    const collection = new CollectionClass();

    if (data instanceof Array && data.length) {
      collection.add(data);
    }

    return collection;
  }

  _parseModel(modelString, data) {
    const modelClassName = modelString.replace('@model:', '');
    const ModelClass = inject(modelClassName);

    return new ModelClass(data);
  }

  /**
   * Merges current with source while preserving collection item references
   *
   * @param current
   * @param source
   * @returns {object}
   * @private
   */
  _smartMerge(current, source) {
    return _.merge(current, source, function (currentValue, sourceValue) {
      if (currentValue instanceof Collection) {
        sourceValue.models.forEach((sourceModel, index) => {
          if (currentValue.models[index]) {
            _.assign(currentValue.models[index], sourceModel);
          } else {
            currentValue.models[index] = sourceModel;
          }
        });
        return currentValue;
      }  if (_.isPlainObject(sourceValue)) {
        return; // let _.merge do the recursion
      }

      return sourceValue;
    });
  }

  /**
   * Parses the data according to defaults definition.
   * Removes properties starting with "$"
   *
   * The parsed data is used for internal model representation.
   *
   * @param data
   * @param defaults
   * @returns {object}
   * @private
   */
  _parse(data, defaults) {
    data = _.cloneDeep(data || {});
    data = this._stripDollars(data);

    return _.merge(data, defaults, (dataValue, defaultValue) => {
      if (defaultValue === '@optional') {
        return typeof dataValue === 'undefined' ? null : dataValue;
      } 
      
      if (defaultValue === '@flat') {
        return unflatten(dataValue);
      } 
      
      if (/^@collection:/.test(defaultValue)) {
        return this._parseCollection(defaultValue, dataValue);
      } 
      
      if (/^@model:/.test(defaultValue)) {
        return this._parseModel(defaultValue, dataValue);
      }
      
      if (_.isPlainObject(defaultValue)) {
        return; // let _.merge do the recursion
      }
      
      return typeof dataValue === 'undefined' ? _.cloneDeep(defaultValue) : dataValue;
    });
  }

  /**
   * Formats the data according to filter definition.
   * The formatted data is used for server request payloads.
   *
   * @param data
   * @param filter
   * @returns {object}
   * @private
   */
  _format(data, filter) {
    if (typeof filter === 'undefined') {
      return;
    }

    if (filter === '@optional') {
      return data === null ? undefined : data;
    }

    if (filter === '@flat') {
      return flatten(data);
    }

    if (/^@collection:/.test(filter)) {
      return data.format();
    }

    if (filter === null || data === null || typeof data === 'undefined' || typeof data !== 'object' || data instanceof Array) {
      return data;
    }

    const res = {};

    _.forOwn(data, (value, key) => {
      value = this._format(value, filter[key]);

      if (!_.isUndefined(value)) {
        res[key] = value;
      }
    });

    return res;
  }

  // PUBLIC
  // static
  static Resource;

  // getters/setters
  get id() {
    return this.data.id || this._cid;
  }

  set id(value) {
    this.data.id = value;
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;
  }

  get promise() {
    return this._promise;
  }

  get resolved() {
    return this._resolved;
  }

  get permission() {
    return this._permission;
  }

  // methods
  isNew() {
    return this.id === this._cid;
  }

  isValid() {
    return this._valid;
  }

  setPermission(Permission) {
    this._permission = new Permission(this);
    return this;
  }

  setValidity(valid) {
    this._valid = valid;
  }

  format() {
    return this._stripDollars(this._format(this.data, this._template));
  }

  parse(data) {
    return this._parse(data, this._template);
  }

  fetch(id, ...rest) {
    return this._action('get', {id});
  }

  /**
   * Clones current model and returns a new instance.
   * New model will be considered new (isNew() === true).
   *
   * @params fetch {boolean} - if true will fetch model data from server before cloning
   * @returns {Model} - new model
   */
  clone(fetch = false, params?) {
    let model, promise;

    if (fetch) {
      promise = this._Resource.get(params || {id: this.id}).$promise;
    } else {
      promise = inject('$q').when(this.format());
    }

    promise = promise.then(data => {
      data.id = null;
      return data;
    });

    model = new (this.constructor as any);
    model._processResponse(promise, 'clone');

    return model;
  }

  save() {
    return this._action('save');
  }

  /**
   * Deletes the model on server.
   * Does nothing for new models.
   *
   * @returns {Promise} - promise resolved with self
   */
  destroy() {
    if (!this.isNew()) {
      return this._action('delete', {id: this.data.id});
    } 
      return this._initPromise(inject('$q').when(this));
    
  }

  meta(key, value?, once = false) {
    if (typeof value === 'undefined') {
      return typeof this._meta[key] === 'function' ? this._meta[key]() : this._meta[key];
    } 
      this._meta[key] = once ? () => {
        this._meta[key] = undefined;
        return value;
      } : value;
      return this;
    
  }
}
