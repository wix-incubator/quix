import {Model} from '../model/model';
import {Collection} from './collection';
import * as angular from 'angular';

describe('Collection: Collection', function () {
  let $httpBackend, $resource, TestModel;

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$httpBackend_, _$resource_) {
    $httpBackend = _$httpBackend_;
    $resource = _$resource_;

    TestModel = createModelClass();
  }));

  function createModelClass() {
    const resource = $resource('/:action', {}, {
      query: {
        method: 'GET',
        isArray: true,
        params: {
          action: 'query'
        }
      }
    });

    class TestModel extends Model {
      constructor(data) {
        super(data, {
          id: null
        });

        this._Resource = resource;
      }

      static Resource = resource;
    }

    return TestModel;
  }

  function createCollection(Model?, action?) {
    return new Collection(Model, action);
  }

  function toDataArray(collection) {
    return (collection.models || collection).map(function (model) {
      return model.data;
    });
  }

  describe('Collection creation', function () {
    it('should create an empty collection', function () {
      const collection = createCollection();

      expect(collection).toBeDefined();
      expect(collection.models.length).toBe(0);
    });
  });

  describe('fetch() (GET)', function () {
    it('should call resource.query and update the models array', function () {
      const collection = createCollection(TestModel);
      collection.fetch();

      $httpBackend.expectGET('/query').respond(200, [{id: 1}, {id: 2}]);
      $httpBackend.flush();

      expect(collection.models.length).toBe(2);
    });

    it('should call resource.query with provided params', function () {
      const collection = createCollection(TestModel);
      collection.fetch({
        myData: 1
      });

      $httpBackend.expectGET('/query?myData=1').respond(200, [{id: 1}, {id: 2}]);
      $httpBackend.flush();

      expect(collection.models.length).toBe(2);
    });

    it('should transform each item in array into a Model', function () {
      const collection = createCollection(TestModel);
      collection.fetch();

      $httpBackend.expectGET('/query').respond(200, [{id: 1}, {id: 2}]);
      $httpBackend.flush();

      expect(collection.models[0] instanceof TestModel).toBe(true);
      expect(collection.models[1] instanceof TestModel).toBe(true);
      expect(collection.models[0].data).toEqual({id: 1});
      expect(collection.models[1].data).toEqual({id: 2});
    });

    it('should be resolved with self', function () {
      const collection = createCollection(TestModel);
      const promise = collection.fetch();
      const spy = jasmine.createSpy('then callback');

      promise.then(spy);

      $httpBackend.expectGET('/query').respond(200, []);
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith(collection);
    });

    it('should throw an exception if action is unsupported', function () {
      const collection = createCollection(TestModel, 'invalidaction');

      expect(function () {
        collection.fetch();
      }).toThrow('Collection: resource is missing definition for "invalidaction" action');
    });
  });

  describe('resolved', function () {
    it('should not be resolved until theres a response from server', function () {
      const collection = createCollection(TestModel);
      collection.fetch();

      $httpBackend.expectGET('/query').respond(200, []);

      expect(collection.resolved).toBe(false);
    });

    it('should be resolved after a server response', function () {
      const collection = createCollection(TestModel);
      collection.fetch();

      $httpBackend.expectGET('/query').respond(200, []);
      $httpBackend.flush();

      expect(collection.resolved).toBe(true);
    });
  });

  describe('promise', function () {
    it('should be set to the latest resource.$promise', function () {
      const collection = createCollection(TestModel);
      collection.fetch();

      $httpBackend.expectGET('/query').respond(200, []);
      $httpBackend.flush();

      expect(collection.promise).toBeDefined();
    });

    it('should be resolved with self', function () {
      const collection = createCollection(TestModel);
      const spy = jasmine.createSpy('then callback');

      collection.fetch();
      collection.promise.then(spy);

      $httpBackend.expectGET('/query').respond(200, []);
      $httpBackend.flush();

      expect(spy).toHaveBeenCalledWith(collection);
    });
  });

  describe('add()', function () {
    it('should return the added item', function () {
      const collection = createCollection(TestModel);
      const item = collection.add({id: 1});

      expect(toDataArray(collection)).toEqual([item.data]);
      expect(item).toBeDefined();
      expect(item.id).toBe(1);
    });

    it('should add multiple items', function () {
      const collection = createCollection(TestModel);
      collection.add([{id: 1}, {id: 2}]);

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}]);
    });

    it('should return the added items', function () {
      const collection = createCollection(TestModel);
      const items = collection.add([{id: 1}, {id: 2}]);

      expect(items.length).toBe(2);
      expect(items[0].id).toBe(1);
      expect(items[1].id).toBe(2);
    });

    it('should transform added item into Model', function () {
      const collection = createCollection(TestModel);
      collection.add({id: 1});

      expect(collection.models[0] instanceof TestModel).toBe(true);
      expect(collection.models[0].data).toEqual({id: 1});
    });

    it('should wrap item in object with data property if Model was not provided', function () {
      const collection = createCollection();
      collection.add({id: 1});

      expect(collection.models[0]).toEqual({data: {id: 1}});
    });

    it('should not transform added item into Model if item is already a Model', function () {
      const collection = createCollection(TestModel);
      const model = new TestModel({id: 1});
      collection.add(model);

      expect(collection.models[0]).toBe(model);
    });

    it('should not transform added item into Model if Model was not provided', function () {
      const collection = createCollection();
      const model = {id: 1};
      collection.add(model);

      expect(collection.models[0].data).toBe(model);
    });
  });

  describe('remove()', function () {
    it('should remove a model and return it', function () {
      const collection = createCollection(TestModel);
      const modelToRemove = collection.add({id: 1});
      const modelToRemain = collection.add({id: 2});

      const removedModel = collection.remove(modelToRemove);

      expect(collection.models).toEqual([modelToRemain]);
      expect(removedModel).toBe(modelToRemove);
    });
  });

  describe('filter()', function () {
    it('should return all items matching the criteria', function () {
      const collection = createCollection(TestModel);
      collection.add({id: 1, status: 'a'});
      collection.add({id: 2, status: 'a'});
      collection.add({id: 3, status: 'b'});

      const items = collection.filter('status', 'a');

      expect(toDataArray(items)).toEqual([{id: 1, status: 'a'}, {id: 2, status: 'a'}]);
    });
  });

  describe('format()', function () {
    it('should call model.format() for each mdoel', function () {
      const collection = createCollection(TestModel);
      const model = collection.add({id: 1});

      spyOn(model, 'format').and.callThrough();

      const formatted = collection.format();

      expect(model.format).toHaveBeenCalled();
      expect(formatted).toEqual([{id: 1}]);
    });
  });

  describe('has()', function () {
    it('should return true if the collection has a mdoel with given id', function () {
      const collection = createCollection(TestModel);
      collection.add({id: 1});

      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(false);
    });
  });

  describe('size()', function () {
    it('should return the length of the models array', function () {
      const collection = createCollection(TestModel);
      collection.add({id: 1});

      expect(collection.size()).toBe(1);
    });
  });
});
