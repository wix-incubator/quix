import {initNgScope, inject} from '../../../core';

export default () => {
  return {
    restrict: 'A',
    scope: {
      onResize: '&',
      brOptions: '=',
    },

    link(scope, element) {
      const conf = initNgScope(scope)
        .withVM({
          $export() {
            return {width: element.width()};
          },
          $import({width}) {
            element.width(width);
          }
        })
        .withOptions('brOptions', {
          minWidth: null,
          handles: null
        })
        .withEvents({
          onResize() {
            inject('$timeout')(() => scope.onToggle({maximized: scope.vm.enabled}));
          }
        });

      if (scope.options.stateName) {
        conf.withState(scope.options.stateName, 'resizable', {});
      }

      inject('$timeout')(() => element.resizable({
        minWidth: scope.options.minWidth,
        handles: scope.options.handles,
        resize(event, ui) {
          ui.size.height = ui.originalSize.height;
          scope.state.save();
        }
      }));
    }
  };
};
