import './icon-badge.scss';
import template from './icon-badge.html';

export default () => {
  return {
    restrict: 'E',
    template,
    transclude: true,
    scope: { count: '<', hide: '<' },
  };
};
