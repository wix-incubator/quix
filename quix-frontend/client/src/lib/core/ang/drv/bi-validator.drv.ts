import {forEach} from 'lodash';
import {inject} from '../../';
import {IDirective, IQService, IParseService} from 'angular';

export default (): IDirective => {
  const $q: IQService = inject('$q');
  const $parse: IParseService = inject('$parse');

  return {
    restrict: 'A',
    require: 'ngModel',

    link(scope: ng.IScope, element, attrs, ngCtrl) {
      const ngModel = ngCtrl as ng.INgModelController;
      const validators = $parse(attrs.validators)(scope);
      const asyncValidators = $parse(attrs.asyncValidators)(scope);
      const validatorsPromise = $q.when(validators || {});
      const asyncValidatorsPromise = $q.when(asyncValidators || {});

      ngModel.$validators = ngModel.$validators || {};
      ngModel.$asyncValidators = ngModel.$asyncValidators || {};

      asyncValidatorsPromise.then(vals => {
        forEach(vals, (validator, name: string) => ngModel.$asyncValidators[name] = validator);
      });

      validatorsPromise.then(vals => {
        forEach(vals, (validator, name: string) => ngModel.$validators[name] = validator);
      });
    }
  };
};
