import {IMeta, IData, IFilterData} from '../../services/chart/chart-conf';
import {isDimension, isDate} from '../../services/chart/chart-utils';
import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'

function getXAxisType(filter: IFilterData, meta: IMeta) {
  if (isDate(filter.x, meta)) {
    return 'datetime';
  }  if (isDimension(filter.x, meta)) {
    return 'category';
  }
  return null;
}

export class ChartRenderer {
  private chart = null;

  constructor(private readonly container) {

  }

  public error(e) {
    this.container.html(`<div class="bi-center bi-danger">${e}</div>`);
  }

  public draw(data: IData[], filteredMeta: IMeta, meta: IMeta, filter: IFilterData) {
    const xAxisType = getXAxisType(filter, meta);

    this.chart = echarts.init(this.container.get(0));
    this.chart.clear();
    this.chart.setOption({
      title: {
        text: null
      },
      tooltip: {
        formatter(params) {
          const pdata = params.data || [0, 0];
          return `${pdata[0].toFixed(2)}, ${pdata[1].toFixed(2)}`;
        }
      },
      legend: {
        show: data.length > 1,
        data: data.map(series => series.name),
        bottom: true
      },
      xAxis: {
        type: xAxisType,
        name: filter.x,
        nameLocation: 'center',
        nameTextStyle: {
          lineHeight: 40
        }
      },
      yAxis: {
        name: filter.y.length === 1 ? filter.y[0] : null,
        nameLocation: 'center',
        nameTextStyle: {
          lineHeight: 40
        }
      },
      series: data
    });
    this.chart.resize();
  }

  public destroy() {
    this.chart.destroy();
  }
}
