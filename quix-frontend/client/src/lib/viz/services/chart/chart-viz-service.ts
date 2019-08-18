import {Viz} from '../viz-service';
import {ChartData} from './chart-data-service';
import {IData, IMeta, IFilterData} from './chart-conf';
import {ChartFilter} from './chart-filter-service';
import {IInputItem, IRenderer} from '../viz-conf';

export class ChartViz extends Viz<IInputItem, IMeta, IData, IMeta, IFilterData> {
  constructor (data: IInputItem[], renderer: IRenderer<IMeta, IData, IFilterData>, {
    fields,
    xMeta,
  }: {
    fields: string[];
    xMeta: 'all' | 'dimensions';
  }) {
    super(new ChartData(data), new ChartFilter(fields, xMeta), renderer);
  }
}
