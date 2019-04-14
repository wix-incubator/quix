import {assign} from 'lodash';

export abstract class VizFilter<Meta, FilterMeta, FilterData> {
  private meta: FilterMeta = {} as any;
  protected data: FilterData = {} as any;

  protected abstract createMeta(meta: Meta, filteredMeta: Meta): FilterMeta;
  protected abstract createData(filterMeta: FilterMeta): FilterData;

  init(meta: Meta, filteredMeta: Meta): VizFilter<Meta, FilterMeta, FilterData> {
    this.meta = assign(this.meta, this.createMeta(meta, filteredMeta));
    this.data = assign(this.data, this.createData(this.meta));

    return this;
  }

  getMeta(): FilterMeta {
    return this.meta;
  }

  getData(): FilterData {
    return this.data;
  }
}
