import moment from 'moment';

if (moment) {
  moment.locale('en', {
    relativeTime : {
      future: 'in %s',
      past: '%s ago',
      s: '%d second',
      ss: '%d seconds',
      m: '%d minute',
      mm: '%d minutes',
      h: '%d hour',
      hh: '%d hours',
      d: '%d day',
      dd: '%d days',
      M: '%d month',
      MM: '%d months',
      y: '%d year',
      yy: '%d years'
    }
  });
}

function getTimezoneOffset(date) {
  return new Date(date).getTimezoneOffset();
}

export default class DateService {
  public static DATE_FORMAT = 'YYYY-MM-DD HH:mm';
  private readonly date: number | string;

  constructor(date?: number | string) {
    this.date = date || Date.now();
  }

  static moment = moment;

  static getRange(duration, {maxDate = null, format = false} = {}) {
    let start, end;
    const now = moment(maxDate || undefined).utc().startOf('day');

    start = now.clone().subtract(moment.duration(duration));
    end = now;

    if (format) {
      start = start.format();
      end = end.format();
    } else {
      start = start.valueOf();
      end = end.valueOf();
    }

    return {start, end};
  }

  static fromUTC(date) {
    return moment(date).add(getTimezoneOffset(date), 'minutes');
  }

  fromUTC() {
    return moment(this.date).add(getTimezoneOffset(this.date), 'minutes');
  }

  toUTC() {
    return moment.utc(this.date).subtract(getTimezoneOffset(this.date), 'minutes');
  }

  asMoment() {
    return moment(this.date);
  }

  asDate() {
    return new Date(this.date as string);
  }
}
