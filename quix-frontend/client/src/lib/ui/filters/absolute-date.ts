import DateService from '../services/date';

export default function() {
  return function (date: string) {
    return DateService.moment(date).format(DateService.DATE_FORMAT);
  };
}
