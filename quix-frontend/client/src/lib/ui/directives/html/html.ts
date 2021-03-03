import { inject } from '../../../core';

export default () => {
  let timeout;

  return {
    restrict: 'A',
    scope: {
      biHtml: '&',
      biHtmlDelay: '@'
    },

    async link(scope, element) {
      const delay = parseInt(scope.biHtmlDelay, 10);
      const html = scope.biHtml({scope: scope.$parent});

      if (!html) {
        return;
      }

      const render = () => element.html(html.html);

      if (!isNaN(scope.biHtmlDelay)) {
        (timeout = timeout || inject('$timeout'))(render, delay);
      } else {
        render();
      }
   }
  };
};
