import {VizData} from '../viz-data-service';
import {IInputItem} from '../viz-conf';
import {IMeta, IData, IFilterData} from './chart-conf';
import {metaTransducer, inputFilterTransducer} from '../../transducers/chart';

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
          x: [],
          y: [],
        };

        const {x, y} = res[serieIndexes[key]];

        x.push(item[filter.x]);
        y.push(item[yField]);
      });

      return res;
    }, []);

    return this;
  }
}
