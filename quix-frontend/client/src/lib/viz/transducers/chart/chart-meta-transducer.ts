import {IInputItem} from '../../services/viz-conf';
import {IMeta} from '../../services/chart/chart-conf';
import {categorizeFields} from '../../services/chart/chart-utils';

export class Meta {
  private index = 0;
  private readonly input = [];
  private meta: IMeta = {
    all: [],
    dimensions: [],
    values: [],
    dates: []
  };

  constructor(private readonly xform) {

  }

  '@@transducer/result'() {
    return {input: this.input, meta: this.meta};
  }

  '@@transducer/step'(res, input: IInputItem, index) {
    this.input.push(input);

    if (this.index === 0) {
      this.meta = categorizeFields(input);
    }

    this.xform['@@transducer/step'](res, [input, this.meta]);
    this.index++;

    return res;
  }
}

export const metaTransducer = () => xform => new Meta(xform);
