import { inject } from "../../../core";

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
      const render = () => element.html(scope.biHtml({scope: scope.$parent}).html);

      if (scope.biHtmlDelay) {
        (timeout = timeout || inject('$timeout'))(render, delay);
      } else {
        render();
      }
   }
  };
};
