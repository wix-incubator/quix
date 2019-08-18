import {VizData} from './viz-data-service';
import {VizFilter} from './viz-filter-service';
import {IRenderer} from './viz-conf';

export class Viz<InputItem, Meta, Data, FilterMeta, FilterData> {
  constructor (
    private readonly data: VizData<InputItem, Meta, Data, FilterData>,
    private readonly fltr: VizFilter<Meta, FilterMeta, FilterData>,
    private readonly renderer: IRenderer<Meta, Data, FilterData>,
  ) {}

  private initFilter() {
    return this.fltr.init(this.data.getMeta(), this.data.getFilteredMeta()).getData();
  }

  getFilter() {
    return this.fltr;
  }

  filterInput(filterTransducer?: (filter: FilterData, meta: Meta) => any): Viz<InputItem, Meta, Data, FilterMeta, FilterData> {
    this.data.filterInput(this.initFilter(), filterTransducer);

    return this;
  }

  filterData(dataFilter?: (data: Data, filter: FilterData, meta: Meta) => Data): Viz<InputItem, Meta, Data, FilterMeta, FilterData> {
    this.data.filterData(this.initFilter(), dataFilter);

    return this;
  }

  filter(): Viz<InputItem, Meta, Data, FilterMeta, FilterData> {
    try {
      return this.filterInput().filterData();
    } catch (e) {
      console.error(e);
      this.renderer.error(e);
      throw e;
    }
  }

  draw(): Viz<InputItem, Meta, Data, FilterMeta, FilterData> {
    this.renderer.draw(this.data.getFilteredData(), this.data.getFilteredMeta(), this.data.getMeta(), this.getFilter().getData());

    return this;
  }

  destroy() {
    this.renderer.destroy();
  }
}
