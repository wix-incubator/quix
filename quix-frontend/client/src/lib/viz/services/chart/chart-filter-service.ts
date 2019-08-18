import {defaults, assign} from 'lodash';
import {IMeta, IFilterData, IFilterMeta} from './chart-conf';
import {VizFilter} from '../viz-filter-service';

function getDefaults(filterMeta: IFilterMeta, fields: string[]): IFilterData {
  const {x, y} = filterMeta;
  const res: IFilterData =  {x: null, y: [], group: [], aggType: 'sum'};

  if (!fields) {
    return assign(res, {x: x[0], y: [y[1]]});
  }

  return fields.reduce((result, field) => {
    if (result.x && result.y.length) {
      return result;
    }

    if (x.indexOf(field) !== -1 && !result.x) {
      result.x = field;
    } else if (y.indexOf(field) !== -1 && !result.y.length) {
      result.y.push(field);
    }

    return result;
  }, res);
}

export class ChartFilter extends VizFilter<IMeta, IFilterMeta, IFilterData> {
  constructor(private readonly fields: string[], private readonly xMeta: 'all' | 'dimensions') {
    super();
  }

  protected createMeta(meta: IMeta, filteredMeta: IMeta): IFilterMeta {
    return {
      all: meta.all,
      dimensions: meta.dimensions,
      values: meta.values,
      dates: meta.dates,
      x: meta[this.xMeta],
      y: meta.values,
      group: [...meta.dimensions, ...meta.values]
    };
  }

  protected createData(filterMeta: IFilterMeta): IFilterData {
    return defaults(this.data, getDefaults(filterMeta, this.fields));
  }
}
