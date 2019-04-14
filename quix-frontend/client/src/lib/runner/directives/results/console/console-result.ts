import template from './console-result.html';
import './console-result.scss';

export default () => {
  return {
    restrict: 'E',
    template,
    scope: {
      query: '<'
    }
  };
};
