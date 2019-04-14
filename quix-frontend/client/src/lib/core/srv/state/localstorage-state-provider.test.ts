'use strict';
import * as angular from 'angular';
import {localStorageStateProvider} from './localstorage-state-provider';

describe('LocalStorageStateProvider', function () {
  const demoData = {
    param1: 'aaa',
    param2: 4
  };

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(function () {
    window.localStorage.clear();
  });

  // beforeEach(inject(function () {
  //   localStorageStateProvider = bi.core.srv.state.localStorageStateProvider;
  // }));

  describe('Save', () => {
    it('should correctly save data', function () {
      let data = JSON.stringify(demoData);
      localStorageStateProvider.setStateData('test', data);
      expect(window.localStorage['test']).toEqual(data);
    });
  });

  describe('Load', () => {
    it('should correctly load data', function () {
      window.localStorage['test'] = JSON.stringify(demoData);
      expect(localStorageStateProvider.getStateData('test')).toEqual(JSON.stringify(demoData));
    });
  });
});
