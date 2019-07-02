import { inject } from "../../../core";

export default () => {
  let timeout;
  let promise = Promise.resolve();

  return {
    restrict: 'A',
    scope: {
      biHtml: '&',
      biHtmlDelay: '@'
    },

    async link(scope, element) {
      const render = () => element.html(scope.biHtml({scope: scope.$parent}).html);

      if (scope.biHtmlDelay) {
        timeout = timeout || inject('$timeout');

        const delay = parseInt(scope.biHtmlDelay, 10);

        promise = new Promise(resolve => promise.then(() => {
          timeout(render, delay).then(resolve);
        }));
      } else {
        render();
      }
   }
  };
};
