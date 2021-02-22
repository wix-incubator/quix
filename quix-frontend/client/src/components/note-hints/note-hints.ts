import template from './note-hints.html';
import './note-hints.scss';

export default () => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    pre(scope: any) {
      scope.ctrlKey = navigator.platform === 'MacIntel' ? 'Command' : 'Ctrl';
    }
  }
});
