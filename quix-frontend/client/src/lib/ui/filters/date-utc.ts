import {inject} from '../../core';
import DateService from '../services/date';

export default function() {
  return function (date: string | number, resolutionOrFormat: 'seconds' | 'milliseconds') {
    date = DateService.fromUTC(date).valueOf();

    let format = 'yyyy-MM-dd HH:mm';

    if (resolutionOrFormat === 'seconds') {
      format += ':ss';
    } else if (resolutionOrFormat === 'milliseconds') {
      format += ':ss.sss';
    } else {
      format = resolutionOrFormat;
    }

    return inject('$filter')('date')(date, format);
  };
}
