import {clone} from 'lodash';
import {seq, compose, map} from 'transducers.js';

export interface ITransducers<Input, Data, Meta, FilterData> {
  inputTransducer?(input: Input): Function;
  inputFilterTransducer?(filterData: FilterData, meta: Meta): Function;
  metaTransducer?(): Function;
  dataTransducer?(meta: Meta): Function;
}

export interface ICustomTransducers<Meta> {
  meta?(): Function;
  data?(meta: Meta): Function;
}

function transduce<Input, Data, Meta, FilterData>(
  rawInput: Input,
  transducers: ITransducers<Input, Data, Meta, FilterData>,
  customTransducers: ICustomTransducers<Meta> = {}
) {
  const {input, meta} = seq(rawInput, compose(
    transducers.inputTransducer(rawInput),
    transducers.metaTransducer(),
    customTransducers.meta()
  ));

  const data = seq(input, compose(
    transducers.dataTransducer(meta),
    customTransducers.data(meta)
  ));

  return {input, meta, data};
}

/**
 * Class responsible for input transformation and filtering
 */
export class VizData<Input, Meta, Data, FilterData> {
  private readonly input: Input;
  private readonly meta: Meta;
  protected data: Data;
  private filteredMeta: Meta;
  protected filteredData: Data;

  constructor(
    rawInput: Input,
    private readonly transducers: ITransducers<Input, Data, Meta, FilterData> = {},
    private readonly customTransducers: ICustomTransducers<Meta> = {}
  ) {
    [
      'inputTransducer',
      'inputFilterTransducer',
      'metaTransducer',
      'dataTransducer'
    ].forEach(transducer => transducers[transducer] = transducers[transducer] || (() => map(x => x)));

    [
      'meta',
      'data'
    ].forEach(transducer => customTransducers[transducer] = customTransducers[transducer] || (() => map(x => x)));

    let input, meta, data;

    if (rawInput && typeof rawInput[Symbol.iterator] === 'function') {
      const res = transduce(rawInput, transducers, this.customTransducers);
      input = res.input;
      meta = res.meta;
      data = res.data;
    } else {
      input = rawInput;
      meta = null;
      data = rawInput;
    }

    this.input = input;
    this.meta = this.filteredMeta = meta;
    this.data = this.filteredData = data;
  }

  public getMeta(): Meta {
    return this.meta;
  }

  public getFilteredMeta(): Meta {
    return this.filteredMeta;
  }

  public getFilteredData(): Data {
    return this.filteredData;
  }

  public filterInput(filter: FilterData, customInputFilterTransducer: (filter: FilterData, meta: Meta) => any = () => map(x => x)): VizData<Input, Meta, Data, FilterData> {
    const input = seq(this.input, compose(customInputFilterTransducer(filter, this.meta), this.transducers.inputFilterTransducer(filter, this.meta)));
    const {meta, data} = transduce(input, this.transducers, this.customTransducers);

    this.filteredMeta = meta;
    this.data = this.filteredData = data;

    return this;
  }

  public filterData(filter: FilterData, dataFilter?: (data: Data, filter: FilterData, meta: Meta) => Data): VizData<Input, Meta, Data, FilterData> {
    if (dataFilter) {
      this.filteredData = dataFilter(clone(this.data), filter, this.filteredMeta);
      return this;
    }

    this.filteredData = clone(this.data);

    return this;
  }
}
