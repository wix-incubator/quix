import {last} from 'lodash';

export default function() {
  const regexp = /(^.)|(_.)|(.[A-Z])/g;

  function capitalize(input: string) {
    return input.replace(regexp, function (match) {
      const res = last(match).toUpperCase();

      if (match.length === 1) {
        return res;
      }  if (match.charAt(0) === '_') {
        return ' ' + res;
      }

      return match.charAt(0) + ' ' + res;
    });
  }

  return function (input: string) {
    return capitalize(input || '');
  };
}
