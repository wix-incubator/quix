import {inject} from '../../core';

export default function() {
  return function (date: string, resolutionOrFormat?: 'seconds' | 'milliseconds') {
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
