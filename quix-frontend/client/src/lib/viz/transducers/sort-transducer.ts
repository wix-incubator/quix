import {seq} from 'transducers.js';
import {IInputItem} from '../services/viz-conf';

export class Sort {
  constructor(private readonly fn, private readonly xform) {

  }

  '@@transducer/result'(v) {
    return seq(v.sort(this.fn), xform => this.xform);
  }

  '@@transducer/step'(res, input: IInputItem) {
    res.push(input);

    return res;
  }
}

export const sort = fn => xform => new Sort(fn, xform);
