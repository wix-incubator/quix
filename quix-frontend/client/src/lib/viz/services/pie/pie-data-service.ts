import {VizData} from '../viz-data-service';
import {IInputItem} from '../viz-conf';
import {IMeta, IData, IFilterData} from '../chart/chart-conf';
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
        const key = yField;
        serieIndexes[key] = typeof serieIndexes[key] === 'undefined' ? res.length : serieIndexes[key];

        res[serieIndexes[key]] = res[serieIndexes[key]] || {
          name: key,
          type: 'pie',
          radius: '55%',
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay(idx) {
            return Math.random() * 200;
          },
          data: []
        };

        res[serieIndexes[key]].data.push({ name: item[filter.x], value: item[yField]});
      });

      return res;
    }, []);

    return this;
  }
}
