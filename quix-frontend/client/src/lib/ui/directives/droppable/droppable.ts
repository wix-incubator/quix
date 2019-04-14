import {utils} from '../../../core';

export default () => {
  return {
    restrict: 'A',
    scope: {
      biDroppable: '&',
    },

    link(scope, element) {
      element.get(0).addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
      });

      element.get(0).addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();

        const data = e.dataTransfer.types.reduce((res, type) => {
          res[type] = e.dataTransfer.getData(type);
          return res;
        }, {});

        utils.scope.safeApply(scope, () => scope.biDroppable(data));
      });
    }
  };
};
