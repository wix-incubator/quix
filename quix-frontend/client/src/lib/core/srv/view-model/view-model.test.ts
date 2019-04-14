'use strict';
import {ViewModel, create as createVM} from './view-model';
import * as angular from 'angular';

describe('bi.core.drv.createViewModel()', function () {

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  describe('creation', function () {
    it('should create an empty view model', function () {
      const vm = createVM();

      expect(vm).toBeDefined();
    });

    it('should create an view model from object', function () {
      const vm = createVM({
        test: true
      }) as any;

      expect(vm.test).toBe(true);
    });

    it('should not alter the template', function () {
      const template = {
        test: true
      };
      const templateString = JSON.stringify(template);

      createVM(template);

      expect(templateString).toBe(JSON.stringify(template));
    });

    it('should use the existing vm', function () {
      const vm = (createVM() as any).vm;
      const vm2 = (createVM(null, vm) as any).vm;

      expect(vm2).toBe(vm);
    });
  });

  describe('flags', function () {
    it('should define basic flags with false values', function () {
      const vm = createVM();

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(false);
    });

    it('should not override template flag values', function () {
      const vm = createVM({
        enabled: true
      });

      expect(vm.enabled).toBe(true);
    });

    it('should initialize nested values', function () {
      const vm = createVM({
        nested: {
          enabled: true
        }
      }) as any;

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(false);
      expect(vm.nested.enabled).toBe(true);
      expect(vm.nested.visible).toBe(false);
    });

    it('should toggle enabled and visible flags', function () {
      const vm = createVM() as any;

      vm.toggle();

      expect(vm.enabled).toBe(true);
      expect(vm.visible).toBe(true);

      vm.toggle(false);

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(false);
    });

    it('should set enabled and visible flags', function () {
      const vm = createVM();

      vm.toggle(true);

      expect(vm.enabled).toBe(true);
      expect(vm.visible).toBe(true);

      vm.toggle(true);

      expect(vm.enabled).toBe(true);
      expect(vm.visible).toBe(true);
    });

    it('should toggle enabled flag', function () {
      const vm = createVM() as any;

      vm.toggleEnabled();

      expect(vm.enabled).toBe(true);
      expect(vm.visible).toBe(false);

      vm.toggleEnabled(true);

      expect(vm.enabled).toBe(true);
      expect(vm.visible).toBe(false);

      vm.toggleEnabled(false);

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(false);
    });

    it('should toggle visible flag', function () {
      const vm = createVM() as any;

      vm.toggleVisible();

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(true);

      vm.toggleVisible(true);

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(true);

      vm.toggleVisible(false);

      expect(vm.enabled).toBe(false);
      expect(vm.visible).toBe(false);
    });
  });

  describe('template cloning', function () {
    it('should deep clone the template (object)', function () {
      const obj = {};
      const vm = createVM({
        test: obj
      }) as any;

      expect(vm.test).not.toBe(obj);
    });

    it('should deep clone the template (array)', function () {
      const arr = [];
      const vm = createVM({
        test: arr
      }) as any;

      expect(vm.test).not.toBe(arr);
    });
  });

  describe('init', function () {
    it('should call $init function', function () {
      const vm = createVM({
        $init: jasmine.createSpy('$init')
      }).init() as any;

      expect(vm.$init).toHaveBeenCalled();
    });

    it('should call $init function (nested values)', function () {
      const vm = createVM({
        nested: {
          $init: jasmine.createSpy('$init')
        }
      }).init() as any;

      expect(vm.nested.$init).toHaveBeenCalled();
    });
  });

  describe('$root', function () {
    it('should define a reference to the root', function () {
      const vm = createVM().init() as any;

      expect(vm.$root).toBe(vm);
    });

    it('should define a reference to the root (nested)', function () {
      const vm = createVM({
        test: {}
      }).init() as any;

      expect(vm.test.$root).toBe(vm);
    });
  });

  describe('$params', function () {
    it('should define custom params', function () {
      const vm = createVM().init({
        foo: 1
      }) as any;

      expect(vm.$params.foo).toBe(1);
    });

    it('should define custom params (nested)', function () {
      const vm = createVM({
        goo: {}
      }).init({
        foo: 1
      }) as any;

      expect(vm.goo.$params.foo).toBe(1);
    });
  });

  describe('createItemsVm()', function () {
    it('should create an items vm object', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm();
        }
      }).init() as any;

      expect(vm.items).toBeDefined();
    });

    it('should create and return item vm by id', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm({
            foo: 1
          });
        }
      }).init() as any;

      const itemVm = vm.items.get({id: 1});

      expect(itemVm instanceof ViewModel).toBe(true);
      expect(itemVm.foo).toBe(1);
    });

    it('should return same vm for items with same identifier', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm();
        }
      }).init() as any;

      const item1Vm = vm.items.get({id: 1});
      const item2Vm = vm.items.get({id: 1});

      expect(item1Vm).toBe(item2Vm);
    });

    it('should return different vm for items with different identifiers', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm();
        }
      }).init() as any;

      const item1Vm = vm.items.get({id: 1});
      const item2Vm = vm.items.get({id: 2});

      expect(item1Vm).not.toBe(item2Vm);
    });

    it('should return null if identifier is not defined', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm();
        }
      }).init() as any;

      const item1Vm = vm.items.get({});

      expect(item1Vm).toBe(null);
    });

    it('should create and return vm by custom identifier', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm().identifyBy(function (item) {
            return item.index;
          });
        }
      }).init() as any;

      const itemVm = vm.items.get({index: 1});

      expect(itemVm instanceof ViewModel).toBe(true);
    });

    it('should delete item vm', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm({
            foo: 1
          });
        }
      }).init() as any;

      const item1Vm = vm.items.get({id: 1});
      vm.items.delete({id: 1});
      const item2Vm = vm.items.get({id: 1});

      expect(item2Vm).not.toBe(item1Vm);
    });

    it('should call $init for each new item vm', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.createItemsVm({
            $init: jasmine.createSpy('$init')
          });
        }
      }).init() as any;

      const item1Vm = vm.items.get({id: 1});

      expect(item1Vm.$init.calls.count()).toBe(1);
    });

    it('should call $init for each existing item vm', function () {
      const vm = createVM({
        $init: function () {
          this.items = this.items || this.createItemsVm({
            $init: jasmine.createSpy('$init')
          });
        }
      }).init() as any;

      const item1Vm = vm.items.get({id: 1});
      vm.items.get({id: 2});

      vm.init();

      expect(item1Vm.$init.calls.count()).toBe(4);
    });
  });

  describe('isHead()', function () {
    it('should return true', function () {
      const vm = createVM();

      expect(vm.isHead()).toBe(true);
    });

    it('should return false', function () {
      const vm = createVM({
        child: {}
      }) as any;

      expect(vm.child.isHead()).toBe(false);
    });
  });

  describe('forEach()', function () {
    it('should apply the function to the root node', function () {
      const vm = createVM();

      const fn = jasmine.createSpy('forEach');
      vm.forEach(fn);

      expect(fn).toHaveBeenCalledWith(vm);
    });

    it('should apply the function for all nodes recursively', function () {
      const vm = createVM({
        child: {}
      }) as any;

      const fn = jasmine.createSpy('forEach');
      vm.forEach(fn);

      expect(fn.calls.allArgs()).toEqual([[vm], [vm.child]]);
    });

    it('should break on first iteration', function () {
      const vm = createVM({
        child: {}
      });

      const fn = jasmine.createSpy('forEach').and.returnValue(false);
      vm.forEach(fn);

      expect((<any>fn).calls.allArgs()).toEqual([[vm]]);
    });

    it('should not be called on a child head nodes', function () {
      const vm = createVM() as any;

      vm.childHead = createVM();

      const fn = jasmine.createSpy('forEach');
      vm.forEach(fn);

      expect(vm.childHead.isHead()).toBe(true);
      expect(fn.calls.allArgs()).toEqual([[vm]]);
    });
  });
});
