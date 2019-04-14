'use strict';
import {ViewModel} from '../../../srv/view-model/view-model';
import {init as initScope} from './scope';
import * as angular from 'angular';

describe('Scope: scopeHelper', function () {

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  let $rootScope, $location, $browser, $q, $timeout;

  beforeEach(inject(function (_$rootScope_, _$location_, _$browser_, _$q_, _$timeout_) {
    $rootScope = _$rootScope_;
    $location = _$location_;
    $browser = _$browser_;
    $q = _$q_;
    $timeout = _$timeout_;
  }));

  describe('withEvents()', function () {
    it('should define actions on scope for read and edit modes', function () {
      const scope: any = {};
      const events = {onClick: angular.noop};

      initScope(scope).withEvents(events);

      expect(scope.events.onClick).toBe(events.onClick);
    });
  });

  describe('withEditableEvents()', function () {
    it('should define actions on scope for edit mode only', function () {
      const scope: any = {};
      const events = {onClick: angular.noop};

      initScope(scope).readonly(true).withEditableEvents(events);

      expect(scope.events.onClick).toBeUndefined();
    });
  });

  describe('events', function () {
    it('should set both event types', function () {
      const scope: any = {};

      initScope(scope)
        .withEvents({onSelect: angular.noop})
        .withEditableEvents({onClick: angular.noop});

      expect(scope.events.onSelect).toBeDefined();
      expect(scope.events.onClick).toBeDefined();
    });
  });

  describe('withActions()', function () {
    it('should define actions on scope for read and edit modes', function () {
      const scope: any = {};
      const actions = {toggle: angular.noop};

      initScope(scope).withActions(actions);

      expect(scope.actions.toggle).toBe(actions.toggle);
    });
  });

  describe('withEditableActions()', function () {
    it('should define actions for edit mode only', function () {
      const scope: any = {};
      const actions = {toggle: angular.noop};

      initScope(scope).readonly(true).withEditableActions(actions);

      expect(scope.actions.toggle).toBeUndefined();
    });
  });

  describe('actions', function () {
    it('should set both action types', function () {
      const scope: any = {};

      initScope(scope)
        .withActions({select: angular.noop})
        .withEditableActions({click: angular.noop});

      expect(scope.actions.select).toBeDefined();
      expect(scope.actions.click).toBeDefined();
    });
  });

  describe('withVM()', function () {
    it('should define vm object on scope', function () {
      const scope: any = {};

      initScope(scope).withVM({test: true});

      expect(scope.vm.test).toBe(true);
    });

    it('should persist the vm by assigning it to the $vm scope variable', function () {
      const scope: any = {};

      initScope(scope).withVM({test: true});

      expect(scope.vm.test).toBe(true);
      expect(scope.$vm.test).toBe(true);
    });

    it('should use and init the scope.$vm view model', function () {
      const scope: any = {
        $vm: {
          init: jasmine.createSpy('scope.$vm.init')
        }
      };

      initScope(scope).withVM({});

      expect(scope.vm).toBe(scope.$vm);
      expect(scope.$vm.init).toHaveBeenCalled();
    });

    it('should define model as custom VM param', function () {
      const scope: any = {
        model: {}
      };

      initScope(scope).withVM({});

      expect(scope.vm.$params.model).toBe(scope.model);
    });

    it('should define ngModel.$modelValue and ngModel.$viewValue as custom VM param', function () {
      const scope: any = {};
      const ngModel = {
        $modelValue: {},
        $viewValue: {}
      };

      initScope(scope, {ngModel}).withVM({});

      expect(scope.vm.$params.modelValue).toBe(ngModel.$modelValue);
      expect(scope.vm.$params.viewValue).toBe(ngModel.$viewValue);
    });

    it('should define custom VM params', function () {
      const scope: any = {};
      const params = {
        foo: 1,
        goo: 2
      };

      initScope(scope).withVM({}, params);

      expect(scope.vm.$params.foo).toBe(1);
      expect(scope.vm.$params.goo).toBe(2);
    });

    it('should throw errors when using ngModel.$modelValue and ngModel.$viewValue if ngModel controller was not passed', function () {
      const scope: any = {};

      initScope(scope).withVM({});

      expect(function () {
        return scope.vm.$params.modelValue;
      }).toThrow('scopeHelper: ngModel controller is required when accesing vm.$params.modelValue');

      expect(function () {
        return scope.vm.$params.viewValue;
      }).toThrow('scopeHelper: ngModel controller is required when accesing vm.$params.viewValue');
    });
  });

  describe('withErrors()', function () {
    it('should set messages on the errors controller', function () {
      const scope: any = {};
      const errors = {
        setMessages: jasmine.createSpy('controllers.errors')
      };
      const messages = [{
        name: 'required',
        text: 'Value is required'
      }];

      initScope(scope, {errors}).withErrors(messages);

      expect(errors.setMessages).toHaveBeenCalledWith(messages);
    });
  });

  describe('readonly()', function () {
    it('should not set events and actions in readonly mode', function () {
      const scope: any = {};

      initScope(scope).readonly(true)
        .withEditableEvents({foo: angular.noop})
        .withEditableActions({foo: angular.noop});

      expect(scope.events.foo).toBeUndefined();
      expect(scope.actions.foo).toBeUndefined();
    });
  });

  describe('thenIfNotReadonly()', function () {
    it('should run when not readonly', function () {
      const scope: any = {};
      const fn = jasmine.createSpy('not readonly');

      initScope(scope)
        .thenIfNotReadonly(fn);

      expect(fn).toHaveBeenCalled();
    });

    it('should not run when readonly', function () {
      const scope: any = {};
      const fn = jasmine.createSpy('not readonly');

      initScope(scope)
        .readonly(true)
        .thenIfNotReadonly(fn);

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('withOptions()', function () {
    it('should set default options when no options where passed', function () {
      const scope: any = {
        testOptions: undefined
      };

      initScope(scope)
        .withOptions(scope.testOptions, {
          opt1: true
        });

      expect(scope.options).toEqual({
        opt1: true
      });
    });

    it('should set default options when options where passed', function () {
      const scope: any = {
        testOptions: {
          opt1: true
        }
      };

      initScope(scope)
        .withOptions(scope.testOptions, {
          opt2: true
        });

      expect(scope.options).toEqual({
        opt1: true,
        opt2: true
      });
    });

    it('should support string as object name', function () {
      const scope: any = {
        testOptions: {
          opt1: true
        }
      };

      initScope(scope)
        .withOptions('testOptions', {
          opt2: true
        });

      expect(scope.options).toEqual({
        opt1: true,
        opt2: true
      });
    });

    it('should deep watch options and update scope.options', function () {
      const scope = $rootScope.$new();

      scope.testOptions = {
        opt1: true
      };

      initScope(scope)
        .withOptions('testOptions', {
          opt1: true
        }, true);

      scope.testOptions.opt1 = false;
      $rootScope.$digest();

      expect(scope.options).toEqual({
        opt1: false
      });
    });

    it('should deep watch options and call handler when no options where passed', function () {
      const scope = $rootScope.$new();
      const handler = jasmine.createSpy('watch handler');

      scope.testOptions = undefined;

      initScope(scope)
        .withOptions('testOptions', {
          opt1: true
        }, handler);

      $rootScope.$digest();

      expect(handler).toHaveBeenCalledWith({
        opt1: true
      }, undefined);
    });

    it('should deep watch options and call handler', function () {
      const scope = $rootScope.$new();
      const handler = jasmine.createSpy('watch handler');

      scope.testOptions = {
        opt1: true
      };

      initScope(scope)
        .withOptions('testOptions', {
          opt1: true
        }, handler);

      $rootScope.$digest();

      scope.testOptions = {
        opt1: false
      };

      $rootScope.$digest();

      expect(handler).toHaveBeenCalledWith({
        opt1: false
      }, {
        opt1: true
      });
    });
  });

  describe('withState', function () {

    let scope;
    function updateURL(url) {
      $location.url(url);
      $browser.poll();
    }

    beforeEach(() => {
      window.localStorage.clear();
    });

    beforeEach(function () {
      scope = $rootScope.$new();
      scope.vm = new ViewModel({
        a: '1',
        b: '2',
        c: '3',
        nestedObj: {
          d: '4',
          $export: function () {
            return {d: this.d};
          },
          $import: function (params) {
            this.d = params.d;
          }
        },
        $export: function () {
          return {a: this.a, b: this.b};
        },
        $import: function (params) {
          this.a = params.a; this.b = params.b;
        }
      });
    });

    it('should save and load variables from localStorage', function () {
      const expectedData = {
        a: '1',
        b: '2',
        c: '100',
        nestedObj: jasmine.objectContaining({
          d: '4'
        })
      };

      initScope(scope).withState('testState', 'testClient', {doClientLoad: false});

      scope.state.save();
      ['a', 'b', 'c'].forEach(field => scope.vm[field] = '100');
      scope.vm.nestedObj.d = 100;
      scope.state.load();
      expect(scope.vm).toEqual(jasmine.objectContaining(expectedData));
    });

    it('should load variables from URL', function () {
      updateURL('/loc1?testState-data=testClient-a:2;');

      initScope(scope).withState('testState', 'testClient', {doClientLoad: true});
      expect(scope.vm.a).toEqual('2');
    });

    it('should handle doClientLoad passed as a promise', function (done) {
      const deferred = $q.defer();

      updateURL('/loc1?testState-data=testClient-a:2;');
      initScope(scope).withState('testState', 'testClient', {doClientLoad: deferred.promise});
      expect(scope.vm.a).toEqual('1');
      deferred.resolve(true);
      scope.$apply();
      setTimeout(() => {
        expect(scope.vm.a).toEqual('2');
        done();
      });
    });

    it('should accept state from parent scope', function () {
      const scope2 = scope.$new();
      scope.vm = new ViewModel({
        a: '1',
        $export: function() {
          return {a: this.a};
        },
        $import: function(params) {
          this.a = params.a;
        }
      });
      scope2.vm = new ViewModel({
        $export: function() {
          return {b: this.b};
        },
        $import: function(params) {
          this.b = params.b;
        },
        b: '2'
      });
      initScope(scope).withState('testState', 'testClient1', {doClientLoad: false});
      initScope(scope2).withState(scope.state, 'testClient2', {doClientLoad: false});
      scope.state.save('testClient2');
      scope2.vm.b = '3';
      scope2.state.load();
      expect(scope2.vm.b).toEqual('2');
    });

    it('should unregister on scope destroy', function () {
      scope.vm = {a: '1'};
      initScope(scope).withState('testState', 'testClient', {doClientLoad: false});
      spyOn(scope.state, 'unregister');
      scope.$destroy();
      expect(scope.state.unregister).toHaveBeenCalled();
    });

  });

});
