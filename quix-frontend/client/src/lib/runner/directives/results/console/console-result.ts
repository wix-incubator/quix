import {IScope} from './console-types';
import template from './console-result.html';
import './console-result.scss';

export default () => {
  return {
    restrict: 'E',
    template,
    scope: {
      query: '<',
    },
    link: {
      async pre(scope: IScope) {
        scope.isTimestampVisible = (timestamp, index, isFirst, isLast) => {
          return (
            isFirst ||
            isLast ||
            scope.query.getResults().buffer[index - 1].timestamp !== timestamp
          );
        };

        scope.groupTextByTimestamp = (timestamp) => {
          return scope.query
            .getResults()
            .buffer.filter(r => r.timestamp === timestamp)
            .map(r => r.line)
            .join('\n');
        };
      },
    },
  };
};
