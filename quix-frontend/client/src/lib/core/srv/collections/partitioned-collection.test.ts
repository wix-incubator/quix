'use strict';
import {Model} from '../model/model';
import {PartitionedCollection} from './partitioned-collection';
import * as angular from 'angular';

describe('Collection: PartitionedCollection', function () {
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
      partitionedQuery: {
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

  function createCollection(chunkSize?) {
    const collection = new PartitionedCollection(TestModel);
    collection.setChunkSize(chunkSize);

    return collection;
  }

  function toDataArray(collection) {
    return collection.models.map(function (model) {
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
    it('should request more items than was defined for chunkSize (chunkSize + 1)', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200);
      $httpBackend.flush();
    });

    it('should fetch the initial chunk', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}]);
    });

    it('should fetch with optional params', function () {
      const collection = createCollection(2);
      collection.fetch({
        param1: 1
      });

      $httpBackend.expectGET('/query?offset=0&param1=1&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}]);
    });

    it('should reset offset if called after more()', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=2&total=3').respond(200, [{id: 3}, {id: 4}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}, {id: 3}, {id: 4}]);

      collection.fetch();
      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}]);
    });

    it('should reset optional params if called afer more()', function () {
      const collection = createCollection(2);
      collection.fetch({
        param1: 1
      });

      $httpBackend.expectGET('/query?offset=0&param1=1&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=2&param1=1&total=3').respond(200, [{id: 3}, {id: 4}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}, {id: 3}, {id: 4}]);

      collection.fetch();
      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}]);
    });

    it('should be resolved with self', function () {
      const collection = createCollection(2);
      const spy = jasmine.createSpy('then callback');

      const promise = collection.fetch();
      collection.promise.then(spy);
      promise.then(spy);

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200);
      $httpBackend.flush();

      expect(spy.calls.allArgs()).toEqual([[collection], [collection]]);
    });
  });

  describe('more() (GET)', function () {
    it('should fetch the next chunk if there are more items to fetch', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=2&total=3').respond(200);
      $httpBackend.flush();
    });

    it('should not fetch the next chunk if there are no more items to fetch', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should fetch the next chunk with same optional params used with fetch()', function () {
      const collection = createCollection(2);
      collection.fetch({
        param1: 1
      });

      $httpBackend.expectGET('/query?offset=0&param1=1&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=2&param1=1&total=3').respond(200);
      $httpBackend.flush();
    });

    it('should send the correct offset', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=2&total=3').respond(200, [{id: 3}, {id: 4}, {id: 5}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=4&total=3').respond(200, [{id: 6}]);
      $httpBackend.flush();
    });

    it('should fetch the next chunk and append it to current models', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      collection.more();
      $httpBackend.expectGET('/query?offset=2&total=3').respond(200, [{id: 3}, {id: 4}]);
      $httpBackend.flush();

      expect(toDataArray(collection)).toEqual([{id: 1}, {id: 2}, {id: 3}, {id: 4}]);
    });

    it('should be resolved with self', function () {
      const collection = createCollection(2);
      const spy = jasmine.createSpy('then callback');
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      const promise = collection.more();
      collection.promise.then(spy);
      promise.then(spy);

      $httpBackend.expectGET('/query?offset=2&total=3').respond(200);
      $httpBackend.flush();

      expect(spy.calls.allArgs()).toEqual([[collection], [collection]]);
    });

  });

  describe('hasMore', function () {
    it('should return true initially', function () {
      const collection = createCollection(2);

      expect(collection.hasMore()).toBe(true);
    });

    it('should return true if response length is equal to the total param', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}, {id: 3}]);
      $httpBackend.flush();

      expect(collection.hasMore()).toBe(true);
    });

    it('should return false if response length is less than the total param', function () {
      const collection = createCollection(2);
      collection.fetch();

      $httpBackend.expectGET('/query?offset=0&total=3').respond(200, [{id: 1}, {id: 2}]);
      $httpBackend.flush();

      expect(collection.hasMore()).toBe(false);
    });
  });

  describe('getChunkSize()', function () {
    it('should return the chunk size', function () {
      const collection = createCollection(2);

      expect(collection.getChunkSize()).toBe(2);
    });
  });
});
