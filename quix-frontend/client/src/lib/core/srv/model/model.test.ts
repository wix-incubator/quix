import {Collection} from '../collections';
import {Model} from './model';
import * as angular from 'angular';
import * as Uuid from 'uuid';

describe('Model: Model', function () {
  let $rootScope, $httpBackend, $resource, mocks, v4Orig;

  beforeEach(function () {
    angular.mock.module('bi.core.internal');

    v4Orig = Uuid.v4;
    Uuid.v4 = function () {
      return 'MOCK-UUID';
    };

    mocks = {
      user: {
        data: {
          email: 'mock-user@wix.com'
        }
      },
      TestCollection: Collection,
      TestModel: Model
    };

    angular.mock.module({
      user: mocks.user,
      TestCollection: mocks.TestCollection,
      TestModel: mocks.TestModel
    });
  });

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$resource_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $resource = _$resource_;
  }));

  afterEach(() => {
    Uuid.v4 = v4Orig;
  });

  function createModel(data?, template?, options?, responseHook?) {
    class TestModel extends Model {
      constructor(data) {
        super(data, template, options);

        this._Resource = $resource('/:action/:id', {}, {
          save: {
            method: 'POST',
            params: {
              action: 'save'
            }
          },
          get: {
            method: 'GET',
            params: {
              action: 'get'
            }
          }
        });

        this._responseHook = responseHook;
      }
    }

    let model = new TestModel(data);

    spyOn(model, 'parse').and.callThrough();
    spyOn(model, 'format').and.callThrough();

    return model;
  }

  describe('instantiation', function () {
    it('should create an empty new model', function () {
      const model = createModel();

      expect(model).toBeDefined();
      expect(model.data).toEqual({});
    });

    it('should create a model with provided data', function () {
      const data = {name: 'John'};
      const model = createModel(data);

      expect(model.data).toEqual(data);
    });

    it('should parse the provided data', function () {
      const data = {name: 'John'};
      const model = createModel(data, data);

      expect(model.data).toEqual(data);
    });
  });

  describe('id', function () {
    it('should return a generatad id with a "new" prefix', function () {
      const model = createModel();

      expect(model.id.indexOf('new')).toBe(0);
    });

    it('should return the actual model id', function () {
      const model = createModel({id: 1});

      expect(model.id).toBe(1);
    });

    it('should set id', function () {
      const model = createModel();
      model.id = 2;

      expect(model.id).toBe(2);
    });
  });

  describe('isNew()', function () {
    it('should be new', function () {
      const model = createModel();

      expect(model.isNew()).toBe(true);
    });

    it('should not be new', function () {
      const model = createModel({id: 1});

      expect(model.isNew()).toBe(false);
    });
  });

  describe('save() (POST)', function () {
    it('should call resource.save and update the data', function () {
      const data = {name: 'John'};
      const model = createModel(data, data);
      model.save();

      $httpBackend.expectPOST('/save', data).respond(200, {id: 1});
      $httpBackend.flush();

      expect(model.id).toEqual(1);
    });

    it('should call resource.save, parse and update the data', function () {
      const data = {};
      const model = createModel(data, data);
      model.save();

      $httpBackend.expectPOST('/save', data).respond(200, {id: 1, name: 'John'});
      $httpBackend.flush();

      expect((model.parse as any).calls.mostRecent().args[0].id).toBe(1);
      expect((model.parse as any).calls.mostRecent().args[0].name).toBe('John');
      expect(model.data.id).toBe(1);
      expect(model.data.name).toBe('John');
    });

    it('should not be new', function () {
      const model = createModel();
      model.save();

      $httpBackend.expectPOST('/save', {}).respond(200, {id: 1});
      $httpBackend.flush();

      expect(model.isNew()).toBe(false);
    });

    it('should be resolved with self', function () {
      const model = createModel();
      const promise = model.save();
      const spy = jasmine.createSpy('then callback');
      promise.then(spy);

      $httpBackend.expectPOST('/save', {}).respond(200, {id: 1});
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith(model);
    });
  });

  describe('fetch() (GET)', function () {
    it('should call resource.get and update the data', function () {
      const model = createModel();
      model.fetch(1);

      $httpBackend.expectGET('/get/1').respond(200, {id: 1});
      $httpBackend.flush();

      expect(model.data.id).toBe(1);
    });

    it('should call resource.get, parse and update the data', function () {
      const model = createModel({}, {});
      model.fetch(1);

      $httpBackend.expectGET('/get/1').respond(200, {id: 1, name: 'John'});
      $httpBackend.flush();

      expect((model.parse as any).calls.mostRecent().args[0].id).toBe(1);
      expect((model.parse as any).calls.mostRecent().args[0].name).toBe('John');
      expect(model.data.id).toBe(1);
      expect(model.data.name).toBe('John');
    });

    it('should not be new', function () {
      const model = createModel();
      model.fetch(2);

      $httpBackend.expectGET('/get/2').respond(200, {id: 2});
      $httpBackend.flush();

      expect(model.isNew()).toBe(false);
    });

    it('should be resolved with self', function () {
      const model = createModel();
      const promise = model.fetch(2);
      const spy = jasmine.createSpy('then callback');
      promise.then(spy);

      $httpBackend.expectGET('/get/2').respond(200, {id: 2});
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith(model);
    });
  });

  describe('destroy()', function () {
    it('should call resource.delete and update the data', function () {
      const data = {id: 2};
      const model = createModel(data, data);
      model.destroy();

      $httpBackend.expectDELETE('/2').respond(200, {id: 2});
      $httpBackend.flush();
    });

    it('should not call resource.delete if the model is new', function () {
      const model = createModel();
      model.destroy();

      $httpBackend.verifyNoOutstandingExpectation();
    });
  });

  describe('resolved', function () {
    it('should not be resolved until theres a response from server', function () {
      const model = createModel();
      model.fetch(2);

      $httpBackend.expectGET('/get/2').respond(200, {id: 2});

      expect(model.resolved).toBe(false);
    });

    it('should be resolved after a server response', function () {
      const model = createModel();
      model.fetch(2);

      $httpBackend.expectGET('/get/2').respond(200, {id: 2});
      $httpBackend.flush();

      expect(model.resolved).toBe(true);
    });
  });

  describe('promise', function () {
    it('should be set to the latest resource.$promise', function () {
      const model = createModel();
      model.fetch(2);

      $httpBackend.expectGET('/get/2').respond(200, {id: 2});
      $httpBackend.flush();

      expect(model.promise).toBeDefined();
    });

    it('should be resolved with self', function () {
      const model = createModel();
      const spy = jasmine.createSpy('then callback');
      model.fetch(2);
      model.promise.then(spy);

      $httpBackend.expectGET('/get/2').respond(200, {id: 2});
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith(model);
    });
  });

  describe('parse()', function () {
    describe('defaults', function () {
      it('should assign defaults for properties with undefined values', function () {
        const data = {};
        const template = {name: 'John'};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          name: 'John'
        });
      });

      it('should not assign defaults for properties with defined values', function () {
        const data = {name: 'John'};
        const template = {name: 'Sam'};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          name: 'John'
        });
      });

      it('should support nesting', function () {
        const data = {nested: {}};
        const template = {nested: {name: 'John'}};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          nested: {
            name: 'John'
          }
        });
      });
    });

    describe('@optional', function () {
      it('should assing null value to optional properties if they are undefined', function () {
        const data = {name: 'John'};
        const template = {name: 'John', lastname: '@optional'};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          name: 'John',
          lastname: null
        });
      });

      it('should not assign null value to optional properties if they are defined', function () {
        const data = {name: 'John', lastname: 'Doe'};
        const template = {name: 'John', lastname: '@optional'};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          name: 'John',
          lastname: 'Doe'
        });
      });
    });

    describe('@flat', function () {
      it('should unflatten the keys', function () {
        const data = {value: {'a.b': 1, 'a.c': 2}};
        const template = {value: '@flat'};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          value: {
            a: {
              b: 1,
              c: 2
            }
          }
        });
      });

      it('should unflatten the keys (more complex example)', function () {
        const data = {value: {'a.b': 1, 'a.c': 2, 'c.d.e': 3}};
        const template = {value: '@flat'};
        const model = createModel(data, template);

        expect(model.data).toEqual({
          value: {
            a: {
              b: 1,
              c: 2
            },
            c: {
              d: {
                e: 3
              }
            }
          }
        });
      });
    });

    describe('@collection', function () {
      it('should convert array to collection', function () {
        const data = {name: 'John', lastnames: [1]};
        const template = {name: 'John', lastnames: '@collection:TestCollection'};
        const model = createModel(data, template);

        expect(model.data.lastnames instanceof mocks.TestCollection).toBe(true);
      });

      it('should create empty collection if array is empty', function () {
        const data = {name: 'John', lastnames: []};
        const template = {name: 'John', lastnames: '@collection:TestCollection'};
        const model = createModel(data, template);

        expect(model.data.lastnames instanceof mocks.TestCollection).toBe(true);
        expect(model.data.lastnames.models.length).toBe(0);
      });

      it('should create empty collection if array is undefined', function () {
        const data = {name: 'John', lastnames: undefined};
        const template = {name: 'John', lastnames: '@collection:TestCollection'};
        const model = createModel(data, template);

        expect(model.data.lastnames instanceof mocks.TestCollection).toBe(true);
        expect(model.data.lastnames.models.length).toBe(0);
      });

      it('should support nesting', function () {
        const data = {name: 'John', nested: {lastnames: []}};
        const template = {name: 'John', nested: {lastnames: '@collection:TestCollection'}};
        const model = createModel(data, template);

        expect(model.data.nested.lastnames instanceof mocks.TestCollection).toBe(true);
      });

      describe('keep model references in existing collections after fetching fresh data', function () {
        it('should copy new models into old models', function () {
          const data = {values: [{id: 1}, {id: 2}]};
          const template = {values: '@collection:TestCollection'};
          const model = createModel(data, template);

          const value1 = model.data.values.models[0];
          const value2 = model.data.values.models[1];
          model.save();

          $httpBackend.expectPOST('/save', data).respond(200, {values: [{id: 10}, {id: 20}]});
          $httpBackend.flush();

          expect(model.data.values instanceof mocks.TestCollection).toBe(true);
          expect(model.data.values.models.length).toBe(2);
          expect(model.data.values.models[0].data).toEqual({id: 10});
          expect(model.data.values.models[1].data).toEqual({id: 20});

          expect(model.data.values.models[0]).toBe(value1);
          expect(model.data.values.models[1]).toBe(value2);
        });

        it('should add new models to an empty collection', function () {
          const data = {values: []};
          const template = {values: '@collection:TestCollection'};
          const model = createModel(data, template);
          model.fetch(1);

          $httpBackend.expectGET('/get/1').respond(200, {values: [{id: 10}, {id: 20}]});
          $httpBackend.flush();

          expect(model.data.values instanceof mocks.TestCollection).toBe(true);
          expect(model.data.values.models.length).toBe(2);
          expect(model.data.values.models[0].data).toEqual({id: 10});
          expect(model.data.values.models[1].data).toEqual({id: 20});
        });
      });
    });

    describe('@model', function () {
      it('should create a model object based on template', function () {
        const data = {name: 'John', lastnames: {lastname: 'Smith'}};
        const template = {name: 'John', lastnames: '@model:TestModel'};
        const model = createModel(data, template);

        expect(model.data.lastnames.data.lastname).toEqual('Smith');
        expect(model.data.lastnames instanceof mocks.TestModel).toBe(true);
      });

    });
  });

 describe('format()', function () {
    describe('defaults', function () {
      it('should remove properties not defined in the template', function () {
        const data = {prop1: true, prop2: true};
        const model = createModel(data, {prop1: null});
        const formatted = model.format();

        expect(formatted).toEqual({
          prop1: true
        });
      });

      it('should strip keys starting with $', function () {
        const data = {$prop: 1};
        const model = createModel(data, {$prop: null});
        const formatted = model.format();

        expect(formatted).toEqual({});
      });

      it('should strip keys starting with $ (nested objects)', function () {
        const data = {prop: {$prop: 1}};
        const model = createModel(data, {prop: null});
        const formatted = model.format();

        expect(formatted).toEqual({prop: {}});
      });

      it('should strip keys starting with $ (arrays)', function () {
        const data = {prop: [{$prop: 1}]};
        const model = createModel(data, {prop: null});
        const formatted = model.format();

        expect(formatted).toEqual({prop: [{}]});
      });
    });

    describe('@optional', function () {
      it('should remove optional properties that are null', function () {
        const data = {name: 'John', lastname: null};
        const template = {name: null, lastname: '@optional'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({
          name: 'John'
        });
      });

      it('should not remove optional properties that are primitive values', function () {
        const data = {name: 'John', lastname: 'Doe'};
        const template = {name: null, lastname: '@optional'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({
          name: 'John',
          lastname: 'Doe'
        });
      });

      it('should not remove optional properties that are objects', function () {
        const data = {name: {first: 'John', last: 'Doe'}};
        const template = {name: '@optional'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({name: {first: 'John', last: 'Doe'}});
      });

      it('should send optional properties that are arrays', function () {
        const data = {prop: []};
        const template = {prop: '@optional'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({prop: []});
      });
    });

    describe('@collection', function () {
      it('should format the collection', function () {
        const data = {values: [1, 2]};
        const template = {values: '@collection:TestCollection'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({values: [1, 2]});
      });
    });

    describe('@flat', function () {
      it('should flatten the keys', function () {
        const data = {
          values: {
            a: {
              b: 1,
              c: 2
            }
          }
        };
        const template = {values: '@flat'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({values: {'a.b': 1, 'a.c': 2}});
      });

      it('should flatten the keys (more complex example)', function () {
        const data = {
          values: {
            a: {
              b: 1,
              c: 2
            },
            c: {
              d: {
                e: 3
              }
            }
          }
        };

        const template = {values: '@flat'};
        const model = createModel(data, template);
        const formatted = model.format();

        expect(formatted).toEqual({values: {'a.b': 1, 'a.c': 2, 'c.d.e': 3}});
      });

      // it('should remove keys starting with $', function () {
      //   const data = {
      //     values: {
      //       a: {
      //         $b: 1
      //       }
      //     }
      //   };

      //   const template = {values: '@flat'};
      //   const model = createModel(data, template);
      //   const formatted = model.format();

      //   expect(formatted).toEqual({values: {'a.b': 1}});
      // });
    });
  });

  describe('clone()', function () {
    it('should fetch event by current id and return a new instance', function () {
      const model = createModel({id: 1});
      const cloned = model.clone(true);

      $httpBackend.expectGET('/get/1').respond(200, {id: 1, name: 'test'});
      $httpBackend.flush();

      expect(cloned).not.toBe(model);
      expect(cloned.data.name).toBe('test');
    });

    it('should fetch event with provided params', function () {
      const model = createModel({id: 1});
      const cloned = model.clone(true, {id: 2});

      $httpBackend.expectGET('/get/2').respond(200, {id: 2, name: 'test'});
      $httpBackend.flush();

      expect(cloned).not.toBe(model);
      expect(cloned.data.name).toBe('test');
    });

    it('should fetch event by current id and return a new instance without id', function () {
      const data = {id: 1, name: 'test'};
      const model = createModel(data, {id: '@optional'});
      const cloned = model.clone(true);

      $httpBackend.expectGET('/get/1').respond(200, {id: 1});
      $httpBackend.flush();

      expect(cloned.data.id).toBe(null);
      expect(cloned.isNew()).toBe(true);
    });

    it('should copy the data and return a new instance', function () {
      const data = {name: 'test'};
      const model = createModel(data, {name: ''});
      const cloned = model.clone();

      $rootScope.$digest();

      expect(cloned).not.toBe(model);
      expect(cloned.data.name).toBe('test');
      expect(cloned.isNew()).toBe(true);
    });

    it('should copy the data and return a new instance without id', function () {
      const data = {id: 1};
      const model = createModel(data, {id: '@optional'});
      const cloned = model.clone();

      $rootScope.$digest();

      expect(cloned.data.id).toBe(null);
      expect(cloned.isNew()).toBe(true);
    });

    it('should set a promise that resolves to self', function () {
      const data = {a: 1};
      const model = createModel(data, data);
      const cloned = model.clone();

      const spy = jasmine.createSpy('cloned.promise');
      cloned.promise.then(spy);

      $rootScope.$digest();

      expect(spy).toHaveBeenCalledWith(cloned);
    });
  });

  describe('meta()', function () {
    it('should set and get a meta property', function () {
      const model = createModel();
      model.meta('test', 1);

      expect(model.meta('test')).toBe(1);
    });

    it('should return undefined for unset values', function () {
      const model = createModel();

      expect(model.meta('test')).toBeUndefined();
    });

    it('should set a value that exists only until first read ', function () {
      const model = createModel();
      model.meta('test', 1, true);

      expect(model.meta('test')).toBe(1);
      expect(model.meta('test')).toBeUndefined();
    });
  });

  describe('isValid()', function () {
    it('should be valid by default', function () {
      const model = createModel();

      expect(model.isValid()).toBe(true);
    });

    it('should set the validity status', function () {
      const model = createModel();
      model.setValidity(false);

      expect(model.isValid()).toBe(false);
    });
  });

  describe('promise.noSync()', function () {
    it('should not update model with next server response if called', function () {
      const data = {name: 'John'};
      const model = createModel(data, data);
      model.save().noSync();

      $httpBackend.expectPOST('/save', data).respond(200, {id: 1, name: 'Jack'});
      $httpBackend.flush();

      expect(model.data.name).toEqual('John');
    });

    it('should return a promise resolved with self', function () {
      const data = {name: 'John'};
      const model = createModel(data, data);
      const promise = model.save().noSync();

      $httpBackend.expectPOST('/save', data).respond(200, {id: 1, name: 'Jack'});
      $httpBackend.flush();

      const spy = jasmine.createSpy('promise');
      promise.then(spy);

      $rootScope.$digest();

      expect(spy).toHaveBeenCalledWith(model);
    });

    it('should apply only once per call', function () {
      const data = {name: 'John'};
      const model = createModel(data, data);

      model.save().noSync();
      $httpBackend.expectPOST('/save', data).respond(200, {id: 1, name: 'Jack'});
      $httpBackend.flush();

      model.save();
      $httpBackend.expectPOST('/save', data).respond(200, {id: 1, name: 'Jack'});
      $httpBackend.flush();

      expect(model.data.name).toEqual('Jack');
    });
  });

  describe('responseHook', function () {
    it('should call hook with "get" action and processed model', function () {
      const spy = jasmine.createSpy('responseHook');
      const model = createModel(undefined, undefined, {}, spy);
      model.fetch(1);

      $httpBackend.expectGET('/get/1').respond(200, {id: 1});
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith({id: 1}, 'get', {noSync: false});
    });

    it('should call hook with "save" action and processed model', function () {
      const spy = jasmine.createSpy('responseHook');
      const data = {name: 'John'};
      const model = createModel(data, data, {}, spy);
      model.save();

      $httpBackend.expectPOST('/save', data).respond(200, {id: 1});
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith({id: 1, name: 'John'}, 'save', {noSync: false});
    });

    it('should call hook with "clone" action and processed model', function () {
      const spy = jasmine.createSpy('responseHook');
      const data = {name: 'John'};
      const model = createModel(data, {name: ''}, {}, spy);

      model.clone();

      $rootScope.$digest();

      expect(spy).toHaveBeenCalledWith({id: null, name: 'John'}, 'clone', {noSync: false});
    });

    it('should call hook with "save" action and noSync=true', function () {
      const spy = jasmine.createSpy('responseHook');
      const data = {name: 'John'};
      const model = createModel(data, data, {}, spy);
      model.save().noSync();

      $httpBackend.expectPOST('/save', data).respond(200, {id: 1});
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith({id: 1, name: 'John'}, 'save', {noSync: true});
    });
  });

  describe('options', function () {
    describe('autoId', function () {
      it('should generate id when data has no id param', function () {
        const model = createModel(undefined, undefined, {autoId: true});

        expect(model.id).toBe('MOCK-UUID');
      });

      it('should not generate id when data has id param', function () {
        const model = createModel({id: 1}, undefined, {autoId: true});

        expect(model.id).not.toBe('MOCK-UUID');
      });

      it('should be considered new', function () {
        const model = createModel(undefined, undefined, {autoId: true});

        expect(model.isNew()).toBe(true);
      });

      it('should not be considered new after fetching a model', function () {
        const model = createModel(undefined, undefined, {autoId: true});
        model.fetch('MOCK-UUID');

        $httpBackend.expectGET('/get/MOCK-UUID').respond(200, {id: 'MOCK-UUID'});
        $httpBackend.flush();

        expect(model.id).toBe('MOCK-UUID');
        expect(model.isNew()).toBe(false);
      });

      it('should not be considered new after saving a new model', function () {
        const data = {};
        const model = createModel(data, data, {autoId: true});
        model.save();

        $httpBackend.expectPOST('/save', data).respond(200, {id: 'MOCK-UUID'});
        $httpBackend.flush();

        expect(model.id).toBe('MOCK-UUID');
        expect(model.isNew()).toBe(false);
      });

      it('should generate id for cloned model', function () {
        const data = {id: 1};
        const model = createModel(data, data, {autoId: true});
        const clonedModel = model.clone();

        $rootScope.$digest();

        expect(clonedModel.id).toBe('MOCK-UUID');
      });

      it('should consider cloned model new', function () {
        const data = {id: 1};
        const model = createModel(data, data, {autoId: true});
        const clonedModel = model.clone();

        $rootScope.$digest();

        expect(clonedModel.isNew()).toBe(true);
      });
    });

    describe('autoOwner', function () {
      it('should assign current user as owner', function () {
        const model = createModel(undefined, undefined, {autoOwner: true});

        expect(model.data.owner).toEqual(mocks.user.data);
      });

      it('should duplicate the user object', function () {
        const model = createModel(undefined, undefined, {autoOwner: true});

        expect(model.data.owner).toEqual(mocks.user.data);
        expect(model.data.owner).not.toBe(mocks.user.data);
      });

      it('should assign current user if owner object is defined without email', function () {
        const model = createModel({owner: {}}, {owner: {}}, {autoOwner: true});

        expect(model.data.owner).toEqual(mocks.user.data);
      });

      it('should not assign current user if owner email is defined', function () {
        const owner = {email: 'some-user@wix.com'};
        const model = createModel({owner: owner}, {owner: {}}, {autoOwner: true});

        expect(model.data.owner).toEqual(owner);
      });

      it('should assign id for cloned model', function () {
        const data = {id: 1};
        const model = createModel(data, data, {autoOwner: true});
        const clonedModel = model.clone();

        $rootScope.$digest();

        expect(clonedModel.data.owner).toEqual(mocks.user.data);
      });
    });
  });

  describe('data', function () {
    it('data property should be assignable', function () {
      const model = createModel();

      model.data = {test: true};
      expect(model.data).toEqual({test: true});
    });
  });
});
