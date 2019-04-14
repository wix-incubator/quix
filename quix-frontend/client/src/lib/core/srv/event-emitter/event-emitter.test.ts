'use strict';
import {EventEmitter} from './event-emitter';
import * as angular from 'angular';

describe('bi.core.srv.EventeMitter', function () {
  let $rootScope: angular.IScope;

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  class ChildEventEmitter extends EventEmitter {
    constructor(private scope?) {
      super(scope);
    }

    getScope(): angular.IScope {
      return this.scope;
    }
  }

  function createEventEmitter({withScope} = {withScope: false}): ChildEventEmitter {
    const scope = withScope ? $rootScope.$new() : undefined;

    return new ChildEventEmitter(scope);
  }

  describe('creation', function () {
    it('should create with a private state member', function () {
      const emitter = createEventEmitter();

      expect(emitter['__state']).toBeDefined();
      expect(emitter['__id']).toBeUndefined();
    });

    it('should create with a state id', function () {
      const emitter = createEventEmitter({withScope: true});

      expect(emitter['__state']).toBeUndefined();
      expect(emitter['__id']).toBeDefined();
    });
  });

  describe('on()', function () {
    it('should reeturn self', function () {
      const emitter = createEventEmitter();

      expect(emitter.on('someEvent', () => true)).toBe(emitter);
    });

    it('should subscribe to event and call handler when triggered', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter
        .on('someEvent', spy)
        .trigger('someEvent');

      expect(spy).toHaveBeenCalled();
    });

    it('should subscribe to event and call multiple handlers when triggered', function () {
      const emitter = createEventEmitter();
      const spy1 = jasmine.createSpy('event handler 1');
      const spy2 = jasmine.createSpy('event handler 2');

      emitter
        .on('someEvent', spy1)
        .on('someEvent', spy2)
        .trigger('someEvent');

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('should subscribe to multiple events and call handlers when triggered', function () {
      const emitter = createEventEmitter();
      const spy1 = jasmine.createSpy('event handler 1');
      const spy2 = jasmine.createSpy('event handler 2');

      emitter
        .on('someEvent', spy1)
        .on('someOtherEvent', spy2)
        .trigger('someEvent')
        .trigger('someOtherEvent');

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('should call handler with triggered args', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter
        .on('someEvent', spy)
        .trigger('someEvent', 1, 2);

      expect(spy).toHaveBeenCalledWith(1, 2);
    });

    it('should not call handler when subscribing to already triggered event', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter.trigger('someEvent');
      emitter.on('someEvent', spy);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call handler when subscribing to already triggered event', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter.trigger('someEvent');
      emitter.on('someEvent', spy, true);

      expect(spy).toHaveBeenCalled();
    });

    it('should call handler with original arguments when subscribing to already triggered event', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter.trigger('someEvent', 1, 2);
      emitter.on('someEvent', spy, true);

      expect(spy).toHaveBeenCalledWith(1, 2);
    });

    it('should call handler with arguments of last triggered event', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter.trigger('someEvent', 1, 2);
      emitter.trigger('someEvent', 3, 4);
      emitter.on('someEvent', spy, true);

      expect(spy.calls.count()).toBe(1);
      expect(spy).toHaveBeenCalledWith(3, 4);
    });
  });

  describe('scope', function () {
    it('should destroy state on scope destroy if created with scope', function () {
      const emitter = createEventEmitter({withScope: true});

      emitter.getScope().$destroy();

      expect(emitter['$state']()).toBeUndefined();
    });

    it('should remove handler on scope destroy if subscribed with scope', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');
      const scope = $rootScope.$new();

      emitter
        .on('someEvent', spy, false, scope)
        .trigger('someEvent');

      scope.$destroy();

      emitter.trigger('someEvent');

      expect(spy.calls.count()).toBe(1);
    });
  });

  describe('onOnce()', function () {
    it('should subscribe to event and call handler when triggered', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter
        .onOnce('someEvent', spy)
        .trigger('someEvent');

      expect(spy).toHaveBeenCalled();
    });

    it('should not call the handler if triggered for a second time', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter
        .onOnce('someEvent', spy)
        .trigger('someEvent')
        .trigger('someEvent');

      expect(spy.calls.count()).toBe(1);
    });

    it('should call handler with original arguments when subscribing to already triggered event, but not more than once', function () {
      const emitter = createEventEmitter();
      const spy = jasmine.createSpy('event handler');

      emitter.trigger('someEvent', 1, 2);
      emitter.onOnce('someEvent', spy, true);
      emitter.trigger('someEvent', 1, 2);

      expect(spy).toHaveBeenCalledWith(1, 2);
      expect(spy.calls.count()).toBe(1);
    });

    it('should not fuck up other event handlers', function () {
      const emitter = createEventEmitter();
      const spyOnce = jasmine.createSpy('once handler');
      const spy = jasmine.createSpy('event handler');

      emitter.onOnce('someEvent', spyOnce, true);
      emitter.on('someEvent', spy, true);
      emitter.trigger('someEvent', 1, 2);

      expect(spyOnce.calls.count()).toBe(1);
      expect(spy.calls.count()).toBe(1);
    });
  });

  describe('triggerStream()', function () {
    it('should call handler on all previous events that were triggered', function () {
      const emitter = createEventEmitter();
      const argsHistory = [];
      const spy = jasmine.createSpy('event handler').and.callFake((...args) => argsHistory.push(args));

      emitter
        .triggerStream('someEvent', 'args1', 2)
        .triggerStream('someEvent', 'args3', 4)
        .on('someEvent', spy, true);

      expect(spy.calls.count()).toBe(2);
      expect(argsHistory).toEqual([['args1', 2], ['args3', 4]]);
    });
  });
});
