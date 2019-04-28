import {VizData} from '../viz-data-service';
import {IInputItem} from '../viz-conf';
import {IMeta, IData, IFilterData} from './chart-conf';
import {metaTransducer, inputFilterTransducer} from '../../transducers/chart';
import { isDimension } from '../../services/chart/chart-utils';

/**
 * Class responsible for input transformation and filtering
 */
export class ChartData extends VizData<IInputItem, IMeta, IData, IFilterData> {
  constructor(input: IInputItem[], customTransducers?) {
    super(input, {
      metaTransducer,
      inputFilterTransducer
    }, customTransducers);
  }

  filterData(filter: IFilterData) {
    const serieIndexes = {};

    this.filteredData = this.data.reduce<any>((res, item) => {
      filter.y.forEach((yField) => {
        const key = `${filter.group.map(field => item[field]).join(' + ')}${
          filter.group.length ? (filter.y.length > 1 ? `[${yField}]` : '') : yField
        }`;

        serieIndexes[key] = typeof serieIndexes[key] === 'undefined' ? res.length : serieIndexes[key];

        res[serieIndexes[key]] = res[serieIndexes[key]] || {
          name: key,
          type: isDimension(filter.x, this.getMeta()) ? 'bar' : 'line',
          data: []
        };

        res[serieIndexes[key]].data.push([item[filter.x], item[yField]]);
      });

      return res;
    }, []);

    return this;
  }
}
