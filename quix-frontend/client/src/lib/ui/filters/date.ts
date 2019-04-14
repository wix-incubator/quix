import {inject} from '../../core';

export default function() {
  return function (date: string, resolution?: 'seconds') {
    let format = 'yyyy-MM-dd HH:mm';

    if (resolution === 'seconds') {
      format += ':ss';
    }

    return inject('$filter')('date')(date, format);
  };
}
