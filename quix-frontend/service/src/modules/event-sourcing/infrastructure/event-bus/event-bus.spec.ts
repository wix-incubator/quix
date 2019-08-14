import {EventBusBuilder} from './event-bus-builder';
import {
  EventBusPluginFn,
  EventBusMiddleware as Middleware,
  HookFn,
} from './types';
import {Dictionary} from 'global-types';
import {Context} from './context';

describe('event bus', () => {
  describe('basic functinality', () => {
    it('should call handler on emit', async () => {
      const spy = jest.fn();
      const bus = EventBusBuilder().build();
      bus.on('foo.create', spy);
      await bus.emit({type: 'foo.create', id: '1', user: 'foo'});
      expect(spy.mock.calls).toHaveLength(1);
    });
  });

  const exptectedMiddlewareArgs = (action: any) => [
    {type: 'foo.create', id: '1'},
    expect.objectContaining({hooks: {call: expect.any(Function)}}),
    expect.any(Function),
  ];

  describe('middlewares', () => {
    it('should call a middleware', async () => {
      const spy = jest.fn((action, api, next) => next(action));
      const bus = EventBusBuilder()
        .addMiddleware(spy)
        .build();
      await bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      expect(spy.mock.calls).toHaveLength(1);
      expect(spy.mock.calls[0]).toMatchObject(
        exptectedMiddlewareArgs({type: 'foo.create', id: '1', user: 'foo'}),
      );
    });

    it('should reject on timeout if callback is not called', async () => {
      const spy = jest.fn();
      const bus = EventBusBuilder()
        .addMiddleware(spy)
        .build({timeout: 300});
      const rv = bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      return rv.catch((e: Error) => {
        expect(e.message).toEqual('Event Bus: timeout');
      });
    });

    it('should pass exceptions upwards', () => {
      const bus = EventBusBuilder()
        .addMiddleware(() => {
          throw new Error('Some Error msg');
        })
        .build();
      const rv = bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      return rv.catch((e: Error) => {
        expect(e.message).toEqual('Some Error msg');
      });
    });

    it('calling next() should pass the action to the next middleware', async () => {
      const middleware1 = jest.fn((arg, api, next) => next());
      const middleware2 = jest.fn((arg, api, next) => next());

      const bus = EventBusBuilder()
        .addMiddleware(middleware1)
        .addMiddleware(middleware2)
        .build();
      await bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      expect(middleware2.mock.calls).toHaveLength(1);
      expect(middleware2.mock.calls[0]).toMatchObject(
        exptectedMiddlewareArgs({type: 'foo.create', id: '1'}),
      );
    });

    it('calling next(result) should pass `result` of one middleware to the next', async () => {
      const middleware1 = jest.fn((arg, api, next) =>
        next({...arg, foo: 'bar'}),
      );
      const middleware2 = jest.fn((arg, api, next) => next(arg));

      const bus = EventBusBuilder()
        .addMiddleware(middleware1)
        .addMiddleware(middleware2)
        .build();
      await bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      expect(middleware2.mock.calls).toHaveLength(1);
      expect(middleware2.mock.calls[0]).toMatchObject(
        exptectedMiddlewareArgs({
          type: 'foo.create',
          id: '1',
          foo: 'bar',
          user: 'foo',
        }),
      );
    });

    it('calling next(error) should stop middlewares and return a rejected promise', () => {
      const bus = EventBusBuilder()
        .addMiddleware((arg, api, next) => {
          next(new Error('Some Error msg'));
        })
        .build();
      const rv = bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      return rv.catch((e: Error) => {
        expect(e.message).toEqual('Some Error msg');
      });
    });

    it('should call lower priority middlewares first', async () => {
      const middleware1 = jest.fn((arg, api, next) =>
        next({...arg, foo: 'bar'}),
      );
      const middleware2 = jest.fn((arg, api, next) => next(arg));

      const bus = EventBusBuilder()
        .addMiddleware(middleware2, {priority: 1})
        .addMiddleware(middleware1, {priority: 0})
        .build();
      await bus.emit({type: 'foo.create', id: '1', user: 'foo'});

      expect(middleware2.mock.calls).toHaveLength(1);
      expect(middleware2.mock.calls[0]).toMatchObject(
        exptectedMiddlewareArgs({type: 'foo.create', id: '1', foo: 'bar'}),
      );
    });
  });

  describe('plugins + hooks', () => {
    let busBuilder: ReturnType<typeof EventBusBuilder>;
    let mockStorage: any[];
    const exampleHooks: Dictionary<HookFn> = {
      validateHook: (action, hookApi) => {
        switch (action.type) {
          case 'doError':
            throw new Error('some validation failed');
          default:
            return;
        }
      },
      saveHook: (action, hookApi) => {
        mockStorage.push(action);
      },
    };
    const validateSpy = jest.spyOn(exampleHooks, 'validateHook');
    const saveSpy = jest.spyOn(exampleHooks, 'saveHook');

    beforeEach(() => {
      mockStorage = [];

      const plugin: EventBusPluginFn = api => {
        api.hooks
          .listen('validate', exampleHooks.validateHook)
          .hooks.listen('save', exampleHooks.saveHook);
      };

      const validationMiddleware: Middleware = async (action, api, next) => {
        api.hooks
          .call('validate', action)
          .then(() => next(action))
          .catch(e => next(e));
      };

      busBuilder = EventBusBuilder()
        .addPlugin('someEntitiy', plugin)
        .addMiddleware(validationMiddleware);
    });

    afterEach(() => {
      validateSpy.mockClear();
      saveSpy.mockClear();
    });

    it('middleware should be able to call plugin hooks', async () => {
      const action = {type: 'bla', id: '1', user: 'foo'};
      const bus = busBuilder.build();
      await bus.emit(action);

      expect(validateSpy.mock.calls).toHaveLength(1);
      expect(validateSpy.mock.calls[0]).toMatchObject([
        action,
        {context: expect.any(Context)},
      ]);
    });

    describe('hook failure/errors', () => {
      it('on error, emit() should return rejected promise', async () => {
        const action = {type: 'doError', id: '1', user: 'foo'};
        const bus = busBuilder.build();
        const error: Error = await bus.emit(action).catch(e => e);
        expect(error.message).toBe('some validation failed');
      });
    });
  });
});
