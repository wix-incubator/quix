import {State} from './state';
import {IStateClient} from './types';

describe('State', function () {

  let state: State;
  beforeEach(() => {
    state = new State('test');
  });

  describe('State::register', () => {
    beforeEach(function() {
        spyOn(console, 'error');
      });

      const client1: IStateClient = {
        name: 'test1',
        exportFunc: () => ({original: true}),
        importFunc: (params) => ({})
      };
      const client1Again: IStateClient = {
        name: 'test1',
        exportFunc: () => ({redefined: true}),
        importFunc: (params) => ({}),
      };

      it('should not override old client with new client with same name', () => {
        state.register(client1);
        state.register(client1Again);
        expect(console.error).toHaveBeenCalledWith('State:register:: trying to register same name twice - test1');
        expect(state.exportAsJSON()).toEqual('{"test1":{"original":true}}');
      });

      it('should register waiting client when original client un-registers', () => {
        state.register(client1);
        state.register(client1Again);
        state.unregister('test1');
        expect(console.error).toHaveBeenCalledWith('State:register:: trying to register same name twice - test1');
        expect(state.exportAsJSON()).toEqual('{"test1":{"redefined":true}}');
      });
  });

  describe('State::export', () => {
    let client1, client2: IStateClient;
    beforeEach(() => {
      client1 = {
        name: 'test1',
        exportFunc: () => ({param1: true, param2: 4}),
        importFunc: (params) => ({})
      };
      client2 = {
        name: 'test2',
        exportFunc: () => ({param2: 'aaaa', param1: 'bbbb'}),
        importFunc: (params) => ({})
      };
    });

    it('should successfully call export function with the provider name and stateName', function () {
      spyOn(client1, 'exportFunc');
      state.register(client1);
      state.exportAsJSON('testProvider');

      expect(client1.exportFunc).toHaveBeenCalledWith('testProvider', 'test');
    });

    it('should successfully call export function with the provider name and stateName', function () {
      spyOn(client1, 'exportFunc');
      state.register(client1);
      state.exportAsURL('testProvider');

      expect(client1.exportFunc).toHaveBeenCalledWith('testProvider', 'test');
    });

    it('successfully export all clients to JSON\\URL', function () {
      state.register(client1);
      state.register(client2);
      expect(state.exportAsJSON())
        .toBe('{"test1":{"param1":true,"param2":4},"test2":{"param2":"aaaa","param1":"bbbb"}}');
      expect(state.exportAsURL())
        .toBe('&test-data=test1-param1:true;test1-param2:4;test2-param2:aaaa;test2-param1:bbbb;');
    });

    it('successfully export specific client to JSON\\URL', function () {
      state.register(client1);
      state.register(client2);
      expect(state.exportAsURL('provider', 'test1'))
        .toBe('&test-data=test1-param1:true;test1-param2:4;');
      expect(state.exportAsJSON('provider', 'test1'))
        .toBe('{"test1":{"param1":true,"param2":4}}');
    });
  });

  describe('State::import', () => {
    let client1, client2: IStateClient;
    let results1, results2;
    beforeEach(() => {
      client1 = {
        name: 'test1',
        exportFunc: () => ({param1: true, param2: 4}),
        importFunc: (params: any) => {
          results1.param1 = params.param1;
          results1.param2 = params.param2;
        }
      };
      client2 = {
        name: 'test2',
        exportFunc: () => ({param2: 'aaaa', param1: 'bbbb'}),
        importFunc: (params: any) => {
          results2.param2 = params.param2;
          results2.param1 = params.param1;
        }
      };
      results1 = {};
      results2 = {};

      state.register(client1);
      state.register(client2);
    });

    it('should successfully import all clients from JSON', function () {
      state.importFromJSON('{"test1":{"param1":true,"param2":4},"test2":{"param2":"aaaa","param1":"bbbb"}}');
      expect(results1).toEqual({param1: true, param2: 4});
      expect(results2).toEqual({param2: 'aaaa', param1: 'bbbb'});
    });

    it('should successfully import to all clients from URL', function () {
      state.importFromURL('test1-param1:true;test1-param2:4;test2-param2:aaaa;test2-param1:bbbb;');
      expect(results1).toEqual({param1: 'true', param2: '4'});
      expect(results2).toEqual({param2: 'aaaa', param1: 'bbbb'});
    });

    it('should correctly process values with colons', function () {
      state.importFromURL('test1-param1:a:b;');
      expect(results1).toEqual({param1: 'a:b', param2: undefined});
    });
  });

  describe('State::unregister', () => {
    let client1, client2: IStateClient;
    let results1, results2;
    beforeEach(() => {
      client1 = {
        name: 'test1',
        exportFunc: () => ({param1: true, param2: 4}),
        importFunc: (params: any) => {
          results1.param1 = params.param1;
          results1.param2 = params.param2;
        }
      };
      client2 = {
        name: 'test2',
        exportFunc: () => ({param2: 'aaaa', param1: 'bbbb'}),
        importFunc: (params: any) => {
          results2.param2 = params.param2;
          results2.param1 = params.param1;
        }
      };
      results1 = {};
      results2 = {};

      state.register(client1);
      state.register(client2);
    });

    it('should not to do anything after client unregistered', function () {
      state.unregister('test2');
      state.importFromJSON('{"test1":{"param1":true,"param2":4},"test2":{"param2":"aaaa","param1":"bbbb"}}');
      expect(results1).toEqual({param1: true, param2: 4});
      expect(results2).toEqual({});
    });

  });
});
