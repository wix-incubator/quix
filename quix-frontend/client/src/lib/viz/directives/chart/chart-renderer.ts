import {IMeta, IData, IFilterData} from '../../services/chart/chart-conf';
import {isDimension, isDate} from '../../services/chart/chart-utils';
import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import {default as essos} from '../theme';

echarts.registerTheme('essos', essos);

function getChartType(filter: IFilterData, meta: IMeta) {
  if (isDimension(filter.x, meta)) {
    return 'bar';
  }
  return 'line';

}

function getXAxisType(filter: IFilterData, meta: IMeta) {
  if (isDate(filter.x, meta)) {
    return 'time';
  } if (isDimension(filter.x, meta)) {
    return 'category';
  }
  return 'value';
}

function getMaxInterval(xAxisType, data) {
  const x = 0
  const series = data[0];
  return xAxisType === 'time' && series.data.length > 1 ? series.data[1][x] - series.data[0][x] : {};
}
export class ChartRenderer {
  private chart = null;

  constructor(private readonly container) {

  }

  public error(e) {
    this.container.html(`<div class="bi-center bi-danger">${e}</div>`);
  }

  public draw(data: IData[], filteredMeta: IMeta, meta: IMeta, filter: IFilterData) {
    const chartType = getChartType(filter, meta);
    const xAxisType = getXAxisType(filter, meta);

    const maxInterval = getMaxInterval(xAxisType, data);
    data.map(series => (series as any).type = chartType);
    this.chart = echarts.init(this.container.get(0), 'essos');
    this.chart.clear();
    this.chart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: data.length > 1,
        data: data.map((series: any) => series.name),
        bottom: true
      },
      grid: {
        top: 10,
        right: 10
      },
      dataZoom: [
        {
          show: xAxisType !== 'category',
          realtime: true,
          start: 20,
          end: 85
        },
        {
          type: 'inside',
          realtime: true,
          start: 65,
          end: 85
        }
      ],
      xAxis: {
        type: xAxisType,
        maxInterval,
        nameLocation: 'center',
        nameTextStyle: {
          lineHeight: 40
        }
      },
      yAxis: {
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
    this.chart.dispose();
  }
}
