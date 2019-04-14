import {IInputItem} from '../services/viz-conf';

export class ParseFloats {
  constructor(private readonly fields: string[], private readonly xform) {

  }

  '@@transducer/result'(v) {
    return this.xform['@@transducer/result'](v);
  }

  '@@transducer/step'(res, input: IInputItem) {
    this.fields.forEach(field => input[field] = parseFloat(input[field]));

    this.xform['@@transducer/step'](res, input);

    return res;
  }
}

export const parseFloats = (fields: string[]) => xform => new ParseFloats(fields, xform);
