import {Model} from '../../ang/srv/ng-model/ng-model';
import {BufferedCollection} from './buffered-collection';
import * as angular from 'angular';

describe('Collection: BufferedCollection', function () {
  let $rootScope;

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  function createCollection(chunkSize?) {
    const collection = new BufferedCollection();
    collection.setChunkSize(chunkSize);

    return collection;
  }

  describe('Collection creation', function () {
    it('should create an empty collection', function () {
      const collection = createCollection();

      expect(collection).toBeDefined();
      expect(collection.models.length).toBe(0);
    });
  });

  describe('fetch()', function () {
    it('should resolve after the next chunk of models is received', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2]);

      $rootScope.$digest();

      expect(collection.size()).toBe(2);
      expect(collection.models).toEqual([{data: 1}, {data: 2}]);
    });

    it('should populate models with next chunk only', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2, 3, 4]);

      $rootScope.$digest();

      expect(collection.size()).toBe(2);
      expect(collection.models).toEqual([{data: 1}, {data: 2}]);
    });

    it('should reset the buffer and models', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2, 3, 4]);
      $rootScope.$digest();

      collection.fetch();
      collection.feed([10, 20]);
      $rootScope.$digest();

      expect(collection.size()).toBe(2);
      expect(collection.models).toEqual([{data: 10}, {data: 20}]);
    });

    it('should note be sealed', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2, 3, 4]);
      collection.seal();
      $rootScope.$digest();

      collection.fetch();
      collection.feed([10, 20]);
      $rootScope.$digest();

      expect(collection.isSealed()).toBe(false);
    });

    it('should be resolved with self', function () {
      const collection = createCollection(2);
      const promise = collection.fetch();
      const spy = jasmine.createSpy('then callback');

      collection.feed([1, 2]);

      collection.promise.then(spy);
      promise.then(spy);

      $rootScope.$digest();

      expect(spy.calls.allArgs()).toEqual([[collection], [collection]]);
    });
  });

  describe('feed()', function () {
    it('should support one-at-a-time feed', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed(1);
      collection.feed(2);

      $rootScope.$digest();

      expect(collection.size()).toBe(2);
      expect(collection.models).toEqual([{data: 1}, {data: 2}]);
    });

    it('should not populate models with next chunk when called subsequently', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2]);
      $rootScope.$digest();

      collection.feed([3, 4]);
      $rootScope.$digest();

      expect(collection.size()).toBe(2);
      expect(collection.models).toEqual([{data: 1}, {data: 2}]);
    });
  });

  describe('more()', function () {
    it('should populate models with the next chunk if it is available', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2, 3, 4]);
      $rootScope.$digest();

      collection.more();
      $rootScope.$digest();

      expect(collection.size()).toBe(4);
      expect(collection.models).toEqual([{data: 1}, {data: 2}, {data: 3}, {data: 4}]);
    });

    it('should populate models with the next chunk after it is fed', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2]);
      $rootScope.$digest();

      collection.more();
      collection.feed([3, 4]);
      $rootScope.$digest();

      expect(collection.size()).toBe(4);
      expect(collection.models).toEqual([{data: 1}, {data: 2}, {data: 3}, {data: 4}]);
    });

    it('should note ignore consequent calls', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2]);
      $rootScope.$digest();

      collection.feed([3, 4, 5, 6]);
      collection.more();
      $rootScope.$digest();
      collection.more();
      $rootScope.$digest();

      expect(collection.size()).toBe(6);
      expect(collection.models).toEqual([{data: 1}, {data: 2}, {data: 3}, {data: 4}, {data: 5}, {data: 6}]);
    });

    it('should be resolved with self', function () {
      const collection = createCollection(2);
      const spy = jasmine.createSpy('then callback');

      collection.fetch();
      collection.feed([1, 2, 3, 4]);
      $rootScope.$digest();

      const promise = collection.more();
      collection.promise.then(spy);
      promise.then(spy);

      $rootScope.$digest();

      expect(spy.calls.allArgs()).toEqual([[collection], [collection]]);
    });
  });

  describe('hasMore()', function () {
    it('should be false by default', function () {
      const collection = createCollection(2);

      expect(collection.hasMore()).toBe(false);
    });

    it('should be true if buffered is bigger than the models', function () {
      const collection = createCollection(2);
      collection.feed(1);

      expect(collection.hasMore()).toBe(true);
    });
  });

  describe('seal()', function () {
    it('should populate models if there only one chunk', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed(1);
      $rootScope.$digest();

      collection.seal();
      $rootScope.$digest();

      expect(collection.size()).toBe(1);
      expect(collection.models).toEqual([{data: 1}]);
    });
  });

  describe('isSealed()', function () {
    it('should return false if the collection isnt sealed', function () {
      const collection = createCollection(2);

      expect(collection.isSealed()).toBe(false);
    });

    it('should return true when the collection is sealed', function () {
      const collection = createCollection(2);
      collection.seal();

      expect(collection.isSealed()).toBe(true);
    });
  });

  describe('bufferSize()', function () {
    it('should return the buffer array length', function () {
      const collection = createCollection(2);
      collection.feed([1, 2, 3]);

      expect(collection.bufferSize()).toBe(3);
    });
  });

  describe('buffer', function () {
    it('should return the buffer array', function () {
      const collection = createCollection(2);
      collection.feed([1, 2, 3]);

      expect(collection.buffer).toEqual([1, 2, 3]);
    });
  });

  describe('rewind()', function () {
    it('should reset the models array', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1, 2, 3]);
      $rootScope.$digest();

      collection.rewind();

      expect(collection.size()).toBe(0);
    });
  });

  describe('flush()', function () {
    it('should flush the buffer into the models array', function () {
      const collection = createCollection(2);
      collection.fetch();
      collection.feed([1]);
      $rootScope.$digest();

      collection.flush();
      $rootScope.$digest();

      expect(collection.models).toEqual([{data: 1}]);
    });
  });
});
