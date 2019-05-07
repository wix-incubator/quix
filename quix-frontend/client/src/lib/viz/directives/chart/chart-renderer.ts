import {IMeta, IFilterData} from '../../services/chart/chart-conf';
import {isDimension, isDate} from '../../services/chart/chart-utils';
import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import {default as theme} from '../theme';

echarts.registerTheme('bi', theme);

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

  public draw(data: any[], filteredMeta: IMeta, meta: IMeta, filter: IFilterData) {
    const chartType = getChartType(filter, meta);
    const xAxisType = getXAxisType(filter, meta);
    const maxInterval = getMaxInterval(xAxisType, data);

    this.chart = echarts.init(this.container.get(0), 'bi');
    this.chart.clear();

    this.chart.setOption({
      useUTC: true,
      xAxis: {
        type: xAxisType,
        maxInterval,
        nameLocation: 'center',
        nameTextStyle: {
          lineHeight: 40
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: true
        },
      },
      yAxis: {
        type: 'value',
        nameLocation: 'center',
        nameTextStyle: {
          lineHeight: 40
        },
        axisLine: {
          show: false
        },
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: data.length > 1,
        bottom: 0
      },
      grid: {
        top: 10,
        right: 10
      },
      series: data.map(series => ({
        ...series,
        type: chartType,
        smooth: false
      }))
    });

    this.chart.resize();
  }

  public destroy() {
    this.chart.dispose();
  }
}
