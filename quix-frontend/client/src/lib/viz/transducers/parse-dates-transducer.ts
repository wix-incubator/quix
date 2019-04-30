import {IInputItem} from '../services/viz-conf';
import {BiDate} from '../../ui';

export class ParseDates {
  constructor(private readonly fields: string[], private readonly xform) {

  }

  '@@transducer/result'(v) {
    return this.xform['@@transducer/result'](v);
  }

  '@@transducer/step'(res, input: IInputItem) {
    this.fields.forEach(field => input[field] = BiDate.moment(input[field]).valueOf());

    this.xform['@@transducer/step'](res, input);

    return res;
  }
}

export const parseDates = (fields: string[]) => xform => new ParseDates(fields, xform);
