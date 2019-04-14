'use strict';

import * as angular from 'angular';
import {UrlParams} from './url-params';

describe('Service: UrlParams', function () {
  let urlParams, $location, $browser, decodeSpy, encodeSpy;

  function updateURL(url) {
    $location.url(url);
    $browser.poll();
  }

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  beforeEach(inject(function (_$location_, _$browser_) {
    urlParams = new UrlParams();
    $location = _$location_;
    $browser = _$browser_;
  }));

  beforeEach(function () {
    decodeSpy = jasmine.createSpy('decode');
    encodeSpy = jasmine.createSpy('encode');
  });

  it('should return expected interface, decode + generateURL', function () {
    updateURL('/loc1?fm-param1=1&fm-param2=hello&fm-param3=true');

    const urlObject = urlParams.register('fm', decodeSpy, encodeSpy);
    expect(typeof urlObject.decode).toBe('function');
    expect(typeof urlObject.generateURL).toBe('function');
  });

  it('should call decode function', function () {
    updateURL('/loc1?fm-param1=1&fm-param2=hello&fm-param3=true');

    const urlObject = urlParams.register('fm', decodeSpy, encodeSpy);
    urlObject.decode();
    expect(decodeSpy).toHaveBeenCalled();
  });

  it('should call decode function, with expected parameters', function () {
    updateURL('/loc1?fm-param1=1&fm-param2=hello&fm-param3&not-param=5');

    const expededObject = {
      param1: '1',
      param2: 'hello',
      param3: true
    };
    const urlObject = urlParams.register('fm', decodeSpy, encodeSpy);
    urlObject.decode();
    expect(decodeSpy).toHaveBeenCalledWith(expededObject);
  });

  it('should call encode function', function () {
    updateURL('/loc1?fm-param1=1&fm-param2=hello&fm-param3&not-param=5');

    const urlObject = urlParams.register('fm', decodeSpy, encodeSpy);
    urlObject.generateURL();
    expect(encodeSpy).toHaveBeenCalled();
  });

  it('should return correct url for all modules', function () {
    const encode = function () {
      return {
        param1: '1',
        param2: 'hello',
        param3: true
      };
    };
    const encodeSecond = function () {
      return {
        param1: '2'
      };
    };

    const decodeSpy = jasmine.createSpy('decode');
    urlParams.register('fm', decodeSpy, encode);
    urlParams.register('second', decodeSpy, encodeSecond);
    const urlResult = urlParams.generateURL();
    expect(urlResult).toBe('fm-param1=1&fm-param2=hello&fm-param3&second-param1=2');
  });

  it('should return correct url for specific module', function () {
    const encode = function () {
      return {
        param1: '1',
        param2: 'hello',
        param3: true
      };
    };
    const encodeSecond = function () {
      return {
        param1: '2'
      };
    };

    urlParams.register('fm', decodeSpy, encode);
    urlParams.register('second', decodeSpy, encodeSecond);
    let urlResult = urlParams.generateURL(['second']);
    expect(urlResult).toBe('second-param1=2');
    urlResult = urlParams.generateURL(['fm']);
    expect(urlResult).toBe('fm-param1=1&fm-param2=hello&fm-param3');
  });

  it('should unregister a module', function () {
    const encodeSecondSpy = jasmine.createSpy('encode');

    const urlObject = urlParams.register('fm', decodeSpy, encodeSpy);
    urlParams.register('second', decodeSpy, encodeSecondSpy);
    urlParams.generateURL();
    expect(encodeSpy).toHaveBeenCalled();
    expect(encodeSecondSpy).toHaveBeenCalled();
    encodeSpy.calls.reset();
    encodeSecondSpy.calls.reset();
    urlObject.unregister();
    urlParams.generateURL();
    expect(encodeSpy).not.toHaveBeenCalled();
    expect(encodeSecondSpy).toHaveBeenCalled();
  });

  it('should throw error when registering same prefix', function () {
    urlParams.register('fm', decodeSpy, encodeSpy);
    expect(function () {
      urlParams.register('fm', decodeSpy, encodeSpy);
    }).toThrow(new Error('urlParams: registered two modules with same prefix: fm'));
  });

  it('should throw error when registering module with dash', function () {
    expect(function () {
      urlParams.register('fm-2', decodeSpy, encodeSpy);
    }).toThrow(new Error('urlParams: can\'t register module name with a dash: fm-2'));
  });

});
