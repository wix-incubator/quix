import {forEach} from 'lodash';

export default () => {
  return {
    restrict: 'A',
    scope: {
      biDraggable: '&',
    },

    link(scope, element) {
      let image;

      element.attr('draggable', true).get(0).addEventListener('dragstart', function(e) {
        const data = scope.biDraggable();

        image = this.cloneNode(true);
        image.style.position = 'fixed';
        image.style.top = '-1000000px';
        document.body.appendChild(image);
        e.dataTransfer.setDragImage(image, 8, 10);

        if (typeof data === 'object') {
          forEach(data, (value, key) => e.dataTransfer.setData(key, value));
        } else if (data) {
          e.dataTransfer.setData('Text', data);
        } else {
          return false;
        }
      });

      element.get(0).addEventListener('dragend', () => image && image.remove());
    }
  };
};
