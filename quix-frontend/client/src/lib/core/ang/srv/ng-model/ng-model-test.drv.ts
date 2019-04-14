'use strict';
import {create as createNgModel} from './ng-model';

  /* @ngInject */
  export function ngModelTest() {
    return {
      template: 'create-model-test',
      restrict: 'E',
      require: 'ngModel',
      scope: {
        template: '=',
        formatter: '&',
        parser: '&',
        validator: '&',
        asyncValidator: '&',
        renderer: '&',
        watcher: '&',
        then: '&',
        keepReference: '=',
        watchDeep: '='
      },

      link: function postLink(scope, element, attrs, ngModel) {
        createNgModel(scope, ngModel)
          .fromTemplate(scope.template)
          .formatWith(scope.formatter())
          .parseWith(scope.parser())
          .validateWith(scope.validator())
          .validateAsyncWith(scope.asyncValidator())
          .renderWith(scope.renderer())
          .watchWith(scope.watcher())
          .keepReference(scope.keepReference)
          .watchDeep(scope.watchDeep)
          .then(scope.then());

        scope.ngModel = ngModel;
      }
    };
  }
