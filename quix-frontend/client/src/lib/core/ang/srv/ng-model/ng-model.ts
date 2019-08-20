'use strict';

/**
 * Core directive tools
 *
 * @author Our One Creator Which Flies and is Spaghetti and a Monster
 */

import {lodash as _} from '../../../utils';

export interface OptionalCloneable<T> {
  $clone?(): T;
}

export interface IScope<T> extends angular.IScope {
  model: T;
}

const tools = {
  createItem(item: any = {}) {
    if (!_.isPlainObject(item)) {
      return item;
    }

    item.$id = item.$id || _.uniqueId('model');

    return item;
  },

  defaultsDeep(data, defaults) {
    let res;

    if (typeof defaults === 'undefined') {
      return data;
    }  if (_.isArray(defaults) || _.isArray(data)) {
      res = _.isArray(data) ? data : defaults;
      res = res.map(item => this.createItem(_.cloneDeep(item)));
    } else if (_.isPlainObject(defaults)) {
      res = _.defaults({}, data, defaults);

      _.forOwn(res, (value, key) => {
        res[key] = this.defaultsDeep(value, defaults[key]);
      });
    } else {
      res = typeof data !== 'undefined' ? data : defaults;
    }

    return res;
  }
};

export class ModelConf {
  public template;
  public formatter;
  public parser;
  public validator;
  public validatorAsync;
  public renderer;
  public watcher;
  public doThen;

  public opts = {
    watchDeep: false,
    log: false,
    feedBack: true
  };

  fromTemplate(template): ModelConf {
    this.template = template;
    return this;
  }

  formatWith(formatter: (model) => any): ModelConf {
    this.formatter = formatter;
    return this;
  }

  parseWith(parser: (model) => any): ModelConf {
    this.parser = parser;
    return this;
  }

  validateWith(validator: () => Object): ModelConf {
    this.validator = validator;
    return this;
  }

  validateAsyncWith(validator: () => Object): ModelConf {
    this.validatorAsync = validator;
    return this;
  }

  renderWith(renderer: (model) => void): ModelConf {
    this.renderer = renderer;
    return this;
  }

  watchWith(watcher: (model, prevModel) => void): ModelConf {
    this.watcher = watcher;
    return this;
  }

  watchDeep(val: boolean): ModelConf {
    this.opts.watchDeep = val;
    return this;
  }

  feedBack(val: boolean): ModelConf {
    this.opts.feedBack = val;
    return this;
  }

  log(): ModelConf {
    this.opts.log = true;
    return this;
  }

  then(doThen: Function): ModelConf {
    this.doThen = doThen;
    return this;
  }
}

export class Model<T extends OptionalCloneable<T>> {
  private feedBack = false;

  constructor(private readonly scope: IScope<T>, private readonly ngModel: angular.INgModelController, private readonly conf: ModelConf) {
    this.initFormat();

    this.initRender(_.once(() => {
      this.initWatch();
      this.initParse();
      this.initValidate();
      if (_.isFunction(conf.doThen)) {
        conf.doThen();
      }
    }));
  }

  private initFormat() {
    this.ngModel.$formatters.push(model => {
      if (this.conf.opts.log) {
        // tslint:disable-next-line: no-console
        console.log('Formatting from', model);
      }

      let res = tools.defaultsDeep(model, this.conf.template || model);

      res = this.conf.formatter ? this.conf.formatter(model) : model;

      if (this.conf.opts.log) {
        // tslint:disable-next-line: no-console
        console.log('Formatted to', res);
      }

      return res;
    });
  }

  private initRender(then) {
    this.ngModel.$render = () => {
      this.scope.model = this.ngModel.$viewValue;

      if (this.conf.renderer) {
        this.conf.renderer(this.scope.model);
      }

      if (this.conf.opts.log) {
        // tslint:disable-next-line: no-console
        console.log('Rendering', this.scope.model);
      }

      this.feedBack = false;

      then();
    };
  }

  private initWatch() {
    let isFirst = true;

    this.scope.$watch('model', (model, prevModel) => {
      const data = this.scope.model && this.scope.model.$clone ? this.scope.model.$clone() : _.clone(this.scope.model);

      if (this.conf.opts.log) {
        // tslint:disable-next-line: no-console
        console.log('Watching', this.scope.model, data, {isFirst, feedBack: this.feedBack});
      }


      if (this.feedBack || (isFirst && this.conf.opts.feedBack)) {
        this.ngModel.$setViewValue(data);
      }

      if (isFirst) {
        this.ngModel.$setPristine();
      }

      if (this.conf.watcher) {
        this.conf.watcher(model, prevModel);
      }

      isFirst = false;
      this.feedBack = true;
    }, !!this.conf.opts.watchDeep);
  }

  private initParse() {
    this.ngModel.$parsers.push(model => {
      if (this.conf.opts.log) {
        // tslint:disable-next-line: no-console
        console.log('Parsing from', model);
      }

      const res = this.conf.parser ? this.conf.parser(model) : model;

      if (this.conf.opts.log) {
        // tslint:disable-next-line: no-console
        console.log('Parsed', res);
      }

      return res;
    });
  }

  private initValidate() {
    if (this.conf.validator) {
      _.forOwn(this.conf.validator(), (fn, name) => {
        this.ngModel.$validators[name] = fn;
      });
    }

    if (this.conf.validatorAsync) {
      _.forOwn(this.conf.validatorAsync(), (fn, name) => {
        this.ngModel.$asyncValidators[name] = fn;
      });
    }
  }
}

export function create<T>(scope: IScope<T>, ngModel: angular.INgModelController): ModelConf {
  const conf = new ModelConf();
  // tslint:disable-next-line: no-unused-expression-chai
  new Model(scope, ngModel, conf);

  return conf;
}

export const createItem = tools.createItem;
