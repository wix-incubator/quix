import './info.scss';
import template from './info.html';

export default () => {
  return {
    restrict: 'E',
    template,
    transclude: true,
    scope: false
  };
};
