'use strict';
import {LocalStorage} from './local-storage';
import * as angular from 'angular';

describe('LocalStorage Wrapper', function () {
  let localStorage: LocalStorage;

  beforeEach(() => {
    localStorage = new LocalStorage();
    localStorage.clear();
  });

  afterEach(() => {
    LocalStorage.setPrefix('');
  });

  it('should store values', function () {
    localStorage.setItem('setting', 'aaaa');
    expect(window.localStorage.getItem('setting')).toEqual('aaaa');
  });

  it('should load values', function () {
    window.localStorage.setItem('setting', 'bbbb');
    expect(localStorage.getItem('setting')).toEqual('bbbb');
  });

  it('should clear all values', function () {
    localStorage.setItem('setting', 'aaaa');
    localStorage.clear();
    expect(localStorage.getItem('setting')).toEqual(null);
  });

  it('should add prefix to saved values when requested', () => {
    LocalStorage.setPrefix('test_');
    localStorage.setItem('setting', 'aaaa');
    expect(window.localStorage.getItem('test_setting')).toEqual('aaaa');
  });

  describe('Custom storage', function () {
    let customStorage = {
      data: {},
      setItem(name, _data) {
        this.data[name] = _data;
      },
      getItem(name) {
        return this.data[name];
      },
      clear() {
        this.data = {};
      }
    };

    beforeEach(() => {
      localStorage.setStorage(customStorage as any);
      customStorage.clear();
    });

    it('should store values', function () {
      localStorage.setItem('setting', 'aaaa');
      expect(customStorage.data['setting']).toEqual('aaaa');
    });

    it('should load values', function () {
      customStorage.data['setting'] = 'bbbb';
      expect(localStorage.getItem('setting')).toEqual('bbbb');
    });

    it('should clear all values', function () {
      localStorage.setItem('setting', 'aaaa');
      localStorage.clear();
      expect(customStorage.data['setting']).toEqual(undefined);
    });

  });

});

describe('LocalStorageWrapper angular provider', () => {
  let lsProvider;

  beforeEach(() => {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(function () {
    angular.mock.module(['biLocalStorageProvider', function (biLocalStorageProvider) {
      lsProvider = biLocalStorageProvider;
    }]);
    angular.mock.inject();
  });

  it('should call set prefix', function () {
    spyOn(LocalStorage, 'setPrefix');
    lsProvider.setPrefix('bla');
    expect(LocalStorage.setPrefix).toHaveBeenCalledWith('bla');
  });

  it('should create a LocalStorage instance', function () {
    // spyOn(bi.core.srv.localStorage, 'LocalStorage');
    // lsProvider.$get();
    // expect(bi.core.srv.localStorage.LocalStorage).toHaveBeenCalled();
    // TODO TODO TODO : restore this test
  });
});
