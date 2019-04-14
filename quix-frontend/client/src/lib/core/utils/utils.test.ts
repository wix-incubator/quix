import * as angular from 'angular';
import {scope, dom} from './';

describe('bi.core.utils', function () {

  beforeEach(function () {
    angular.mock.module('bi.core.internal');
  });

  let safeApply, $rootScope: ng.IRootScopeService;
  beforeEach(inject(function (_$rootScope_) {
    $rootScope = _$rootScope_;
    safeApply = scope.safeApply;
  }));

  describe('safeApply', () => {
    it('should call function', function () {
      const scope = $rootScope.$new();
      const spy = jasmine.createSpy('scope spy');
      safeApply(scope, spy);
      expect(spy).toHaveBeenCalled();
    });

    it('should call function, even if inside $apply', function () {
      const scope = $rootScope.$new();
      const spy = jasmine.createSpy('scope spy');

      expect(() => scope.$apply(() => scope.$apply(spy))).toThrow();
      expect(spy).not.toHaveBeenCalled();

      expect(() => scope.$apply(() => safeApply(scope, spy))).not.toThrow();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('escape', () => {
    it('should html-escape string', function () {
      expect(dom.escape('foo & bar')).toEqual('foo &amp; bar');
    });
  });

});
