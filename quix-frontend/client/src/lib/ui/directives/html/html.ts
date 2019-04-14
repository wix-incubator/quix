export default () => {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      biHtml: '&'
    },

    link(scope, element, attrs, ctrl, transclude) {
      const {html} = scope.biHtml({scope: scope.$new()});

      element.html(html);
   }
  };
};
