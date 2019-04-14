'use strict';
import * as angular from 'angular';
import {ngModelTest} from './ng-model-test.drv';

describe('bi.core.drv.createModel()', function () {
  let scope, $rootScope, $compile, $timeout, $q: angular.IQService;

  function createModel(params) {
    let {data, template, formatter, parser, validator, asyncValidator, renderer, watcher, keepReference, watchDeep, then} = <any>(params || {});
    let scope = $rootScope.$new();
    let directiveScope;

    scope.data = data;
    scope.template = template;
    scope.formatter = formatter;
    scope.parser = parser;
    scope.asyncValidator = asyncValidator;
    scope.validator = validator;
    scope.renderer = renderer;
    scope.watcher = watcher;
    scope.keepReference = keepReference;
    scope.watchDeep = watchDeep;
    scope.then = then;

    const element = angular.element('<create-model-test ng-model="data" template="template" async-validator="asyncValidator" formatter="formatter" parser="parser" validator="validator" renderer="renderer" watcher="watcher" keep-reference="keepReference" watch-deep="watchDeep" then="then"></create-model-test>');
    $compile(element)(scope);
    directiveScope = element.isolateScope();

    $rootScope.$digest();
    $timeout.flush();

    return {
      get data() {
        return scope.data;
      },
      set data(_data) {
        scope.data = _data;
      },
      get directiveData() {
        return directiveScope.model;
      },
      set directiveData(data) {
        directiveScope.model = data;
      },
      get ngModel() {
        return directiveScope.ngModel;
      }
    };
  }

  beforeAll(() => {
    angular
      .module('bi.core')
      .directive('createModelTest', ngModelTest);
  });

  beforeEach(function () {
      angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_, _$q_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $q = _$q_;
  }));

  describe('createModel', function () {
    describe('creation', function () {
      it('should be undefined if no data and template were set', function () {
        const model = createModel({});

        expect(model.data).toEqual(undefined);
        expect(model.directiveData).toEqual(undefined);
      });

      it('should use the data object as is if template is undefined', function () {
        const data = {a: 1};
        const model = createModel({data});

        expect(model.data).toEqual(data);
        expect(model.directiveData).toEqual(data);
      });

      it('should create a model with the provided data and null template', function () {
        const data = {a: 1};
        const model = createModel({data});

        expect(model.data).toEqual(data);
        expect(model.directiveData).toEqual(data);
      });

      it('should populate undefined model with template values', function () {
        const template = {a: 1};
        const model = createModel({template});

        expect(model.data).toEqual(template);
        expect(model.directiveData).toEqual(template);
      });

      it('should populate null model with template values', function () {
        const template = {a: 1};
        const model = createModel({template, data: null});

        expect(model.data).toEqual(template);
        expect(model.directiveData).toEqual(template);
      });

      it('should populate empty model with template values', function () {
        const data = {};
        const template = {a: 1};
        const model = createModel({data, template});

        expect(model.data).toEqual(template);
        expect(model.directiveData).toEqual(template);
      });

      it('should fill model with default template values', function () {
        const data = {a: 0};
        const template = {a: 1, b: []};
        const model = createModel({data, template});

        expect(model.data).toEqual({a: 0, b: []});
        expect(model.directiveData).toEqual({a: 0, b: []});
      });

      it('should support nesting', function () {
        let data = {a: 0, b: {d: 4}};
        const template = {a: 1, b: {c: 3, d: 4}};

        let model = createModel({data, template});

        expect(model.data).toEqual({a: 0, b: {c: 3, d: 4}});
        expect(model.directiveData).toEqual({a: 0, b: {c: 3, d: 4}});

        data = {a: 0, b: {d: 4}};
        model = createModel({data, template: {a: 1, b: null}});

        expect(model.data).toEqual({a: 0, b: {d: 4}});
        expect(model.directiveData).toEqual({a: 0, b: {d: 4}});
      });
    });

    describe('original model reference', function () {
      it('should not keep the reference by default', function () {
        const data = {a: 1};
        const model = createModel({data});

        expect(model.data).not.toBe(data);
        expect(model.data).toEqual(data);
        expect(model.directiveData).not.toBe(data);
        expect(model.directiveData).toEqual(data);
      });

      it('should not keep the reference', function () {
        const data = {a: 1};
        const model = createModel({data, keepReference: false});

        expect(model.data).not.toBe(data);
        expect(model.data).toEqual(data);
        expect(model.directiveData).not.toBe(data);
        expect(model.directiveData).toEqual(data);
      });

      it('should keep the reference (with data)', function () {
        const data = {a: 1};
        const model = createModel({data, keepReference: true});

        expect(model.directiveData).toBe(data);
        expect(model.directiveData).toBe(model.data);
      });

      it('should keep the reference (with template)', function () {
        const template = {a: 1};
        const model = createModel({template, keepReference: true});

        expect(model.directiveData).toBe(model.data);
      });

      it('should keep the reference (with parser)', function () {
        const data = {a: 1};
        const model = createModel({
          data,
          parser(model) {
            return {a: 2};
          },
          keepReference: true
        });

        expect(model.data).toBe(data);
        expect(model.data).toEqual({a: 2});
      });

      it('should keep the reference (with formatter)', function () {
        const data = {a: 1};
        const model = createModel({
          data,
          formatter(model) {
            return {a: 2};
          },
          keepReference: true
        });

        expect(model.data).toBe(data);
        expect(model.data).toEqual({a: 2});
      });

      it('should not override primitive values', function () {
        const data = 1;
        const model = createModel(data);

        model.directiveData = 2;
        $rootScope.$digest();

        expect(model.data).toBe(2);
        expect(model.directiveData).toBe(2);
      });
    });

    describe('changing directive model reference', function () {
      it('should change the model accordingly', function () {
        const data = {a: 1};
        const model = createModel({data});

        model.directiveData = {a: 2};
        $rootScope.$digest();

        expect(model.data).toEqual({a: 2});
        expect(model.directiveData).toEqual({a: 2});
      });

      it('should call model.$clone method if it is defined', function () {
        const clonedData = {a: 2};
        const data = {a: 1};
        const model = createModel({data});

        model.directiveData = {
          $clone: function () {
            return clonedData;
          }
        };
        $rootScope.$digest();

        expect(model.data).toBe(clonedData);
      });
    });

    describe('changing directive model property', function () {
      it('should not change the model', function () {
        const data = {a: 1};
        const model = createModel({data});
        model.directiveData.a = 2;
        $rootScope.$digest();

        expect(model.data).toEqual({a: 1});
        expect(model.directiveData).toEqual({a: 2});
      });
    });

    describe('changing model reference', function () {
      it('should change the directive model accordingly', function () {
        const data = {a: 1};
        const model = createModel({data, template: {a: null}});
        model.data = {a: 2};
        $rootScope.$digest();

        expect(model.data).toEqual({a: 2});
        expect(model.directiveData).toEqual({a: 2});
      });
    });

    describe('formatter', function () {
      it('should format the data with provided formatter', function () {
        const data = {a: 1};
        const formatter = jasmine.createSpy('formatter').and.returnValue({a: 2});
        const model = createModel({data, formatter});

        expect(model.data).toEqual({a: 2});
        expect(model.directiveData).toEqual({a: 2});
      });

      it('should keep class structure when formatting the data with provided formatter', function () {
        const data = {a: 1};

        class DemoClass {
          private a;
          constructor(data) {
            this.a = data.a + 1;
          }

          foobar() {
            return this.a;
          }
        }

        const formatter = {
          formatter: (model) => new DemoClass(model)
        };

        spyOn(formatter, 'formatter').and.callThrough();

        const model = createModel({data, formatter: formatter.formatter});

        expect(formatter.formatter).toHaveBeenCalled();
        expect(model.data).toEqual({a: 2});
        expect(model.directiveData.foobar()).toEqual(2);
      });

    });

    describe('parser', function () {
      it('should parse the model with provided parser', function () {
        const data = {a: 1};
        const parser = jasmine.createSpy('parser').and.returnValue({a: 2});
        const model = createModel({data, parser});

        expect(model.data).toEqual({a: 2});
        expect(model.directiveData).toEqual({a: 1});
      });
    });

    describe('formatter + parser', function () {
      it('should format and parse the model', function () {
        const data = {a: 1};
        const formatter = jasmine.createSpy('formatter').and.returnValue({a: 2});
        const parser = jasmine.createSpy('parser').and.returnValue({a: 3});
        const model = createModel({data, formatter, parser});

        expect(model.data).toEqual({a: 3});
        expect(model.directiveData).toEqual({a: 2});
      });
    });

    describe('validator', function () {
      it('should validate the data with provided validator', function () {
        const data = {a: 1};
        const testValidator = jasmine.createSpy('testValidator');
        const validator = function () {
          return {
            testValidator: testValidator
          };
        };

        createModel({data, validator});

        expect(testValidator).toHaveBeenCalled();
      });

      it('should set model to be "undefined" if validation fails', function () {
        const data = {a: 1};
        const testValidator = jasmine.createSpy('testValidator').and.returnValue(false);
        const validator = function () {
          return {
            testValidator: testValidator
          };
        };

        const model = createModel({data, validator});

        expect(model.data).toBeUndefined();
        expect(model.directiveData).toEqual(data);
      });

      it('should preserve the model if validation succeeds', function () {
        const data = {a: 1};
        const testValidator = jasmine.createSpy('testValidator').and.returnValue(true);
        const validator = function () {
          return {
            testValidator: testValidator
          };
        };

        const model = createModel({data, validator});

        expect(model.data).toEqual(data);
        expect(model.directiveData).toEqual(data);
      });

      it('should trigger validation after model reference change', function () {
        const data = {a: 1};
        const testValidator = jasmine.createSpy('testValidator').and.callFake(function (model) {
          return model.valid;
        });

        const validator = function () {
          return {
            testValidator: testValidator
          };
        };

        const model = createModel({data, validator});
        model.directiveData = {a: 1};
        $rootScope.$digest();

        expect(model.data).toBeUndefined();
        expect(model.directiveData).toEqual({a: 1});
      });
    });

    describe('asyncValidator', function () {
      it('should validate the data with provided validator', function (done) {
        const data = {a: 1};
        const deferred = $q.defer();
        const testValidator = jasmine.createSpy('testValidator').and.returnValue(deferred.promise);
        const asyncValidator = () => ({testValidator});

        createModel({data, asyncValidator});
        deferred.resolve(true);
        deferred.promise.finally(() => {
          expect(testValidator).toHaveBeenCalled();
          done();
        });
        $rootScope.$apply();
      });

      it('should set model to be "undefined" if validation fails', function (done) {
        const data = {a: 1};
        const deferred = $q.defer();

        const testValidator = jasmine.createSpy('testValidator').and.returnValue(deferred.promise);
        const asyncValidator = () => ({testValidator});

        const model = createModel({data, asyncValidator});

        deferred.reject();
        $rootScope.$digest();

        deferred.promise.finally(() => {
          expect(model.data).toBeUndefined();
          expect(model.directiveData).toEqual(data);
          done();
        });
        $rootScope.$digest();
      });

      it('should preserve the model if validation succeeds', function (done) {
        const data = {a: 1};
        const deferred = $q.defer();

        const testValidator = jasmine.createSpy('testValidator').and.returnValue(deferred.promise);
        const asyncValidator = () => ({testValidator});

        const model = createModel({data, asyncValidator});
        deferred.resolve();
        $rootScope.$digest();

        deferred.promise.finally(() => {
          expect(model.data).toEqual(data);
          expect(model.directiveData).toEqual(data);
          done();
        });
        $rootScope.$digest();
      });

      it('should trigger validation after model reference change', function (done) {
        const data = {a: 1};
        const deferred = $q.defer();

        const testValidator = jasmine.createSpy('testValidator').and.returnValue(deferred.promise);

        const asyncValidator = () => ({testValidator});
        const model = createModel({data, asyncValidator});

        deferred.reject();
        $rootScope.$digest();

        model.directiveData = {a: 1};
        $rootScope.$digest();

        deferred.promise.finally(() => {
          expect(testValidator.calls.count()).toEqual(3);
          expect(model.data).toBeUndefined();
          expect(model.directiveData).toEqual({a: 1});
          done();
        });
        $rootScope.$digest();
      });
    });

    describe('watcher', function () {
      it('should run when the model is created', function () {
        const data = {a: 1};
        const watcher = jasmine.createSpy('testWatcher');

        createModel({data, watcher});

        expect(watcher).toHaveBeenCalledWith(data, data);
      });

      it('should run the watcher every time the model reference changes', function () {
        const data = {a: 1};
        const watcher = jasmine.createSpy('testWatcher');

        const model = createModel({data, watcher});

        model.directiveData = {a: 1};
        $rootScope.$digest();
        expect(watcher).toHaveBeenCalledWith({a: 1}, {a: 1});
      });
    });

    describe('renderer', function () {
      it('should run when the model is created', function () {
        const data = {a: 1};
        const renderer = jasmine.createSpy('testRenderer');

        createModel({data, renderer});

        expect(renderer).toHaveBeenCalledWith(data);
      });
    });

    describe('unique id', function () {
      it('should assign unique id to array items (no template)', function () {
        const data = {a: [{}]};

        const model = createModel({data});

        expect(model.data.a[0].$id).toBeDefined();
      });

      it('should assign unique id to the model (with template)', function () {
        const data = {a: [{}]};
        const template = {a: []};

        const model = createModel({data, template});

        expect(model.data.a[0].$id).toBeDefined();
      });

      it('should ingore primitive values', function () {
        const data = {a: [1]};

        const model = createModel({data});

        expect(model.data.a[0]).toBe(1);
      });

      it('should ingore null values', function () {
        const data = {a: [null]};

        const model = createModel({data});

        expect(model.data.a[0]).toBe(null);
      });

      it('should preserve the original id and reference', function () {
        const data = {$id: 1};
        const model = createModel({data});

        model.directiveData = {a: 2};

        $rootScope.$digest();

        expect(model.data).toBe(data);
        expect(model.data).toEqual({$id: 1, a: 2});
      });

      it('should not preserve the original reference (no id)', function () {
        const data = {};

        const model = createModel({data});
        model.directiveData = {a: 2};

        $rootScope.$digest();

        expect(model.data).not.toBe(data);
        expect(model.data).toEqual({a: 2});
      });

      it('should not preserve the original reference (id + keepReference === false)', function () {
        const data = {$id: 1};

        const model = createModel({data, keepReference: false});
        model.directiveData = {a: 2};

        $rootScope.$digest();

        expect(model.data).not.toBe(data);
        expect(model.data).toEqual({a: 2});
      });
    });

    describe('watchDeep', function () {
      it('should deep watch the model', function () {
        const data = {a: 1};
        const model = createModel({data, watchDeep: true});

        model.directiveData.a = 2;
        $rootScope.$digest();

        expect(model.data).toEqual({a: 2});
      });

      it('should not deep watch the model', function () {
        const data = {a: 1};
        const model = createModel({data});

        model.directiveData.a = 2;
        $rootScope.$digest();

        expect(data).toEqual({a: 1});
      });
    });

    describe('call then function', function () {
      it('should call function in an async manner', function (done) {
        const then = function () {
          done();
        };
        const data = {a: 1};
        createModel({data, then});
        $rootScope.$digest();
      });
    });

    describe('pristine state', function () {
      it('should leave ngModel in pristine state on initial change', function () {
        const data = {a: 1};
        const model = createModel({data});
        $rootScope.$digest();

        expect(model.ngModel.$dirty).toBe(false);
      });

      it('should not set ngModel to pristine state after making changes', function () {
        const data = {a: 1};
        const model = createModel({data});
        $rootScope.$digest();

        model.directiveData = {a: 2};
        $rootScope.$digest();

        expect(model.ngModel.$dirty).toBe(true);
      });
    });
  });
});
