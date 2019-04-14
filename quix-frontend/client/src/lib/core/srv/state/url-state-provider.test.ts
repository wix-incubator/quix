'use strict';
import {urlStateProvider} from './url-state-provider';
import * as angular from 'angular';

describe('UrlStateProvider', function () {

  let $location, $browser;

  function updateURL(url) {
    $location.url(url);
    $browser.poll();
  }

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$location_, _$browser_) {
    $location = _$location_;
    $browser = _$browser_;
  }));

  describe('Load', () => {
    it('should correctly load data', function () {
      updateURL('/loc1?test-data=param1:2;parma2=aaa');
      expect(urlStateProvider.getStateData('test')).toEqual('param1:2;parma2=aaa');
    });

    it('should return null when no data in url', function () {
      updateURL('/loc1?test-data=param1:2;parma2=aaa');
      expect(urlStateProvider.getStateData('test2')).toEqual(null);
    });
  });

});
