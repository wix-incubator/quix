'use strict';

import {lodash as _} from '../../utils';
import {get as inject} from '../../srv/injector';

export function biOptions() {
  const $parse: ng.IParseService = inject('$parse');
  const $interpolate: ng.IInterpolateService = inject('$interpolate');

  const NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+order\s+by\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?$/;
  // 1: value expression (valueFn)
  // 2: label expression (displayFn)
  // 3: group by expression (groupByFn)
  // 4: disable when expression (disableWhenFn)
  // 5: array item variable name
  // 6: object item key variable name
  // 7: object item value variable name
  // 8: collection expression
  // 9: track by expression

  function parseExpression(str: string) {
    const match = str.match(NG_OPTIONS_REGEXP);

    if (!(match)) {
      throw new Error('biOptions: bad expression "' + str + '"');
    }

    // The variable name for the value of the item in the collection
    const valueName = match[5] || match[7];
    // The variable name for the key of the item in the collection
    const keyName = match[6];

    // An expression that generates the viewValue for an option if there is a label expression
    const selectAs = / as /.test(match[0]) && match[1];
    // An expression that is used to track the id of each object in the options collection
    const trackBy = match[10];
    // An expression that generates the viewValue for an option if there is no label expression
    const valueFn = $parse(match[2] ? match[1] : valueName);
    const selectAsFn = selectAs && $parse(selectAs);
    const viewValueFn = selectAsFn || valueFn;
    const trackByFn = trackBy && $parse(trackBy);

    const orderBy = match[9];
    const orderByFn = orderBy && $parse(orderBy);

    const displayFn = $parse(match[2] || match[1]);
    const groupBy = match[3] || '';
    const groupByFn = $parse(match[3] || '');
    const disableWhen = match[4] || '';
    const disableWhenFn = $parse(disableWhen);
    const values = match[8];
    const valuesFn = $parse(values);

    return {valueName, keyName, selectAs, trackBy, valueFn, selectAsFn, viewValueFn, orderBy, orderByFn, trackByFn, displayFn, groupBy, groupByFn, disableWhen, disableWhenFn, valuesFn, values};
  }

  function getLocals(options: {valueName: string}, value) {
    const locals = {};
    locals[options.valueName] = value;

    return locals;
  }

  return {
    restrict: 'A',
    require: ['biOptions', 'ngModel'],
    scope: false,

    controller: ['$scope', '$attrs', function ($scope, $attrs) {
      const options = parseExpression($interpolate($attrs.biOptions)($scope));
      let watcher = null;

      $scope.$watch(options.values, values => _.isFunction(watcher) && watcher(values));

      this.hasGroupBy = function () {
        return !!options.groupBy;
      };

      this.hasOrderBy = function () {
        return !!options.orderBy;
      };

      this.hasTrackBy = function () {
        return !!options.trackBy;
      };

      this.hasDisabledWhen = function () {
        return !!options.disableWhen;
      };

      this.getKey = function () {
        return options.keyName;
      };

      this.getItemName = function () {
        return options.valueName;
      };

      this.getCollection = function () {
        return options.valuesFn($scope);
      };

      this.groupBy = function (value) {
        return options.groupByFn($scope, getLocals(options, value));
      };

      this.isDisabled = function (value) {
        return options.disableWhenFn($scope, getLocals(options, value));
      };

      this.orderBy = function (value) {
        return options.orderByFn($scope, getLocals(options, value));
      };

      this.trackBy = function (value) {
        return options.trackByFn($scope, getLocals(options, value));
      };

      this.render = function (value) {
        return options.displayFn($scope, getLocals(options, value));
      };

      this.format = function (value) {
        if (!options.selectAsFn) {
          return value;
        }

        const collection = this.getCollection();
        return (_.isArray(collection) && _.find(collection, item => {
          return options.selectAsFn($scope, getLocals(options, item)) === value;
        })) || value;
      };

      this.parse = function (value) {
        if (!options.selectAsFn) {
          return value;
        }

        return options.selectAsFn($scope, getLocals(options, value));
      };

      this.eval = function (str, value) {
        return $parse(str)($scope, getLocals(options, value));
      };

      this.watch = function (fn) {
        watcher = fn;
      };
    }]
  };
}
