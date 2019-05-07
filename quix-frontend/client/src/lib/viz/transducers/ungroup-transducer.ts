import {clone} from 'lodash';
import {IInputItem} from '../services/viz-conf';

export interface IUngroupConf {
  fields: string[];
  values: string[];
  aggType: 'sum' | 'avg';
}

export class Ungroup {
  private readonly inputCache = {};
  private readonly indexCache = {};

  constructor(private readonly conf: IUngroupConf, private readonly xform) {

  }

  '@@transducer/result'(v) {
    return this.xform['@@transducer/result'](v);
  }

  '@@transducer/step'(res, input: IInputItem) {
    const key = this.conf.fields.map(field => input[field]).join('|');

    if (!this.inputCache[key]) {
      this.inputCache[key] = clone(input);
      this.indexCache[key] = 1;
      this.xform['@@transducer/step'](res, this.inputCache[key]);
    } else {
      this.conf.values.forEach(value => {
        if (this.conf.aggType === 'sum') {
          this.inputCache[key][value] += input[value];
        } else if (this.conf.aggType === 'avg') {
          this.inputCache[key][value] = ((this.inputCache[key][value] * this.indexCache[key]) + input[value]) / (this.indexCache[key] + 1);
        }
      });

      this.indexCache[key]++;
    }

    return res;
  }
}

export const ungroup = (conf: IUngroupConf) => xform => new Ungroup(conf, xform);
