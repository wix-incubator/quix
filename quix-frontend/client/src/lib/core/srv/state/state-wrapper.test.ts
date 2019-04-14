import * as angular from 'angular';
import {StateWrapper} from './state-wrapper';
import {ViewModel, create as createViewModel} from '../view-model/view-model';
type Dictionary<T> = _.Dictionary<T>;

function createDefaultExportImport(obj, paramList: string[]) {
  obj.$export = function(stateName) {
    const res = {};
    paramList.forEach(paramName => {
      res[paramName] = obj[paramName];
    });
    return res;
  };

  obj.$import = function(data: Dictionary<any>) {
    paramList.forEach(paramName => {
      obj[paramName] = data[paramName];
    });
  };
}

describe('LocalStorageStateProvider', function () {

  let $location, $browser,
    $q: ng.IQService,
    $rootScope: ng.IRootScopeService;

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$location_, _$browser_, _$q_, _$rootScope_) {
    $location = _$location_;
    $browser = _$browser_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(() => {
    window.localStorage.clear();
  });

  function updateURL(url) {
    $location.url(url);
    $browser.poll();
  }

  describe('check mandatory parameters', function () {
    const demoObject = {};
    it('should throw error when no Object is passed', function () {
      expect(() =>  StateWrapper.build().end()).toThrow(new Error('StateWrapperBuilder::build: You must provide an object'));

      expect(() => {
        StateWrapper.build()
          .useObject(demoObject)
          .end();
      }).toThrow(new Error('StateWrapperBuilder::build: You must provide a clientName'));

      expect(() => {
        StateWrapper.build()
          .useObject(demoObject)
          .setClientName('test')
          .end();
      }).toThrow(new Error('StateWrapperBuilder::build: You must provide a state'));

    });
  });

  describe('Basic Load\\Save', function () {
    let demoObject;
    beforeEach(function () {
      demoObject = {
        a: 'aaa',
        b: {bb: 'bbb'}
      };
      createDefaultExportImport(demoObject, ['a']);
      createDefaultExportImport(demoObject.b, ['bb']);
    });

    it('should save values local storage', function () {
      const stateWrapper = StateWrapper.build()
        .useObject(demoObject)
        .withNewState('demoState')
        .setClientName('test')
        .end();
      stateWrapper.save();
      expect(window.localStorage.getItem('demoState')).toBe('{"test":{"a":"aaa","bb":"bbb"}}');
    });

    it('should load values local storage', function () {
      window.localStorage['demoState'] = '{"test":{"a":"bbb","bb":"ccc"}}';
      StateWrapper.build()
        .useObject(demoObject)
        .withNewState('demoState')
        .setClientName('test')
        .end();
      expect(demoObject.a).toBe('bbb');
      expect(demoObject.b.bb).toBe('ccc');
    });

    it('should load values from local storage and then by url', function () {
      window.localStorage['demoState'] = '{"test":{"a":"bbb"}}';
      updateURL('/loc1?demoState-data=test-a:ccc');
      StateWrapper.build()
        .useObject(demoObject)
        .withNewState('demoState')
        .setClientName('test')
        .end();
      expect(demoObject.a).toBe('ccc');
    });

    it('should load values ONLY from local storage if requested', function () {
      window.localStorage['demoState'] = '{"test":{"a":"bbb"}}';
      updateURL('/loc1?demoState-data=test-a:ccc');
      StateWrapper.build()
        .useObject(demoObject)
        .withNewState('demoState')
        .setClientName('test')
        .withProviders(['localStorage'])
        .end();
      expect(demoObject.a).toBe('bbb');
    });
  });

  describe('use custom traverse', function () {
    let vm;
    beforeEach(function () {
      vm = createViewModel({
        a: 'aaa',
        b: {
          bb: 'bbb'
        }
      });
      createDefaultExportImport(vm, ['a']);
      createDefaultExportImport(vm.b, ['bb']);
    });

    it('should save values local storage', function () {
      const stateWrapper = StateWrapper.build()
        .useObject(vm)
        .withNewState('demoState')
        .setClientName('test')
        .withCustomTraverse(function (vm: ViewModel, callback, args) {
          vm.forEach(function (vm) {
            callback(vm, args);
          });
        })
        .end();
      stateWrapper.save();
      expect(window.localStorage.getItem('demoState')).toBe('{"test":{"a":"aaa","bb":"bbb"}}');
    });

    it('should load values local storage', function () {
      window.localStorage['demoState'] = '{"test":{"a":"bbb"}}';
      StateWrapper.build()
        .useObject(vm)
        .withNewState('demoState')
        .setClientName('test')
        .withCustomTraverse(function (vm: ViewModel, callback, args) {
          vm.forEach(function (vm) {
            callback(vm, args);
          });
        })
        .end();
      expect(vm.a).toBe('bbb');
    });

  });

  describe('various options', function () {
    let demoObject1, demoObject2, deepObject;
    beforeEach(function () {
      demoObject1 = {
        a: 'aaa',
        b: 'bbb'
      };
      demoObject2 = {
        c: 'ccc',
        d: 'ddd'
      };
      deepObject = {
        a: 'aaa',
        b: {bb: 'bbb'}
      };

      createDefaultExportImport(demoObject1, ['a', 'b']);
      createDefaultExportImport(demoObject2, ['c', 'd']);
      createDefaultExportImport(deepObject, ['a']);
      createDefaultExportImport(deepObject.b, ['bb']);

    });

    it('should load only once when oneTimeLoad = true', function () {
      window.localStorage['demoState'] = '{"test1":{"a":"bbb"},"test2":{"c":"ddd"}}';
      const stateWrapper1 = StateWrapper.build()
        .useObject(demoObject1)
        .withNewState('demoState')
        .setClientName('test1')
        .withOptions({oneTimeLoad: true})
        .end();
      StateWrapper.build()
        .useObject(demoObject2)
        .withState(stateWrapper1)
        .setClientName('test2')
        .end();
      expect(demoObject1.a).toBe('bbb');
      expect(demoObject2.c).toBe('ddd');
      demoObject1.a = 'aaa';
      demoObject2.c = 'ccc';
      stateWrapper1.loadAll(); /* loading again, demoObject2 should load again, demoObject1 should not */
      expect(demoObject1.a).toBe('aaa');
      expect(demoObject2.c).toBe('ddd');
    });

    it('should load\\save only one level of Object when deep = false ', function () {
      window.localStorage['demoState'] = '{"test":{"a":"bbb","b":"ccc"}}';
      const stateWrapper = StateWrapper.build()
        .useObject(deepObject)
        .withNewState('demoState')
        .setClientName('test')
        .withOptions({deep: false})
        .end();
      stateWrapper.load();
      expect(deepObject.a).toBe('bbb');
      expect(deepObject.b.bb).toBe('bbb');
      window.localStorage['demoState'] = '';
      stateWrapper.save();
      expect(window.localStorage['demoState']).toBe('{"test":{"a":"bbb"}}');
    });

    it('should not load automatically when doClientLoad = false', function () {
      window.localStorage['demoState'] = '{"test1":{"a":"bbb"}}';
      const stateWrapper1 = StateWrapper.build()
        .useObject(demoObject1)
        .withNewState('demoState')
        .setClientName('test1')
        .withOptions({doClientLoad: false})
        .end();
      expect(demoObject1.a).toBe('aaa');
      stateWrapper1.load();
      expect(demoObject1.a).toBe('bbb');
    });

    it('should not load automatically when doClientLoad = false, and load when promised is resolved', function (done) {
      window.localStorage['demoState'] = '{"test1":{"a":"bbb"}}';
      const deferred = $q.defer<any>();
      StateWrapper.build()
        .useObject(demoObject1)
        .withNewState('demoState')
        .setClientName('test1')
        .withOptions({doClientLoad: deferred.promise})
        .end();

      expect(demoObject1.a).toBe('aaa');
      deferred.resolve(true);
      deferred.promise.then(() => {
        setTimeout(() => {
          expect(demoObject1.a).toBe('bbb');
          done();
        });
      });
      $rootScope.$apply();
    });

    it('should not load automatically when doGlobalLoad = false', function () {
      window.localStorage['demoState'] = '{"test1":{"a":"bbb"}}';
      const stateWrapper1 = StateWrapper.build()
        .useObject(demoObject1)
        .withNewState('demoState')
        .setClientName('test1')
        .withOptions({doGlobalLoad: false})
        .end();

      expect(demoObject1.a).toBe('aaa');
      stateWrapper1.load(); /* even though we load, globalLoad is turned off */
      expect(demoObject1.a).toBe('aaa');
    });

    it('should not load automatically when doGlobalLoad = false, and but should allow load when promised is resolved', function (done) {
      window.localStorage['demoState'] = '{"test1":{"a":"bbb"}}';
      const deferred = $q.defer();
      const stateWrapper1 = StateWrapper.build()
        .useObject(demoObject1)
        .withNewState('demoState')
        .setClientName('test1')
        .withOptions({doGlobalLoad: deferred.promise as any})
        .end();

      expect(demoObject1.a).toBe('aaa');
      stateWrapper1.load();
      expect(demoObject1.a).toBe('aaa');

      deferred.resolve(true);
      deferred.promise.then(() => {
        setTimeout(() => {
          stateWrapper1.load();
          expect(demoObject1.a).toBe('bbb');
          done();
        });
      });
      $rootScope.$apply();
    });

  });

});
