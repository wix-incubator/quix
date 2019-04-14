import {forEach} from 'lodash';

export default () => {
  return {
    restrict: 'A',
    scope: {
      biDraggable: '&',
    },

    link(scope, element) {
      element.attr('draggable', true).get(0).addEventListener('dragstart', e => {
        const data = scope.biDraggable();

        if (typeof data === 'object') {
          forEach(data, (value, key) => e.dataTransfer.setData(key, value));
        } else {
          e.dataTransfer.setData('Text', data);
        }
      });
    }
  };
};
