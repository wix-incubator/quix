import {utils} from '../../../core';

export default function() {
  return {
    restrict: 'A',
    scope: {
      biOnImageLoad: '<'
    },

    link(scope, element) {
      element.
        on('load', () => {
          utils.scope.safeApply(scope, () => scope.biOnImageLoad.onLoad && scope.biOnImageLoad.onLoad());
        }).
        on('error', () => {
          utils.scope.safeApply(scope, () => scope.biOnImageLoad.onError && scope.biOnImageLoad.onError());
        });
    }
  };
}
