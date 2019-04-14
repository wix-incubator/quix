import * as angular from 'angular';
import {biOptions} from './ang/drv/bi-options.drv';
import {default as biValidator} from './ang/drv/bi-validator.drv';
import {LocalStorage} from './srv/local-storage/local-storage';

angular.module('bi.core', [])
  .run(['$injector', ($injector: angular.auto.IInjectorService) => {
    window.dispatchEvent(new CustomEvent('biCore.injector.ready', {detail: $injector}));
  }])
  .provider('biLocalStorage', () => {
    return {
      setPrefix(name) {
        LocalStorage.setPrefix(name);
      },
      $get() {
        return new LocalStorage();
      }
    };
  });

if ((window as any).__biCoreLoaded) {
  console.warn('warning: multiple bi-core instances.');
} else {
  (window as any).__biCoreLoaded = true;
}

angular.module('bi.core')
  .directive('biOptions', biOptions)
  .directive('biValidator', biValidator);
