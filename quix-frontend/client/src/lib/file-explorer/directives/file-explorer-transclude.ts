import Controller from '../services/file-explorer-controller';

export default function () {
  return {
    restrict: 'E',
    require: '^biFileExplorer',
    scope: {
      file: '<'
    },
    link: {
      pre (scope, element, attrs, controller: Controller) {
        controller.transclude(element, scope.file);
      }
    }
  };
}

