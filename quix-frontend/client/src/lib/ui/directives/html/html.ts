export default () => {
  return {
    restrict: 'A',
    scope: {
      biHtml: '&'
    },

    async link(scope, element) {
      let html = scope.biHtml({scope: scope.$parent});

      if (html.then) {
        html = await html;
      } else {
        html = html.html;
      }

      element.html(html);
   }
  };
};
