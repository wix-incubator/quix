import {inject} from '../../core';
import DateService from '../services/date';

export default function() {
  return function (date: string | number, resolution: 'seconds' | 'milliseconds') {
    date = DateService.fromUTC(date).valueOf();

    let format = 'yyyy-MM-dd HH:mm';

    if (resolution === 'seconds') {
      format += ':ss';
    } else if (resolution === 'milliseconds') {
      format += ':ss.sss';
    }

    return inject('$filter')('date')(date, format);
  };
}
