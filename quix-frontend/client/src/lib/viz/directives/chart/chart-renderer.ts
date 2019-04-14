// import HS from 'highcharts/highstock';
import {IMeta, IData, IFilterData} from '../../services/chart/chart-conf';
import {isDimension, isDate} from '../../services/chart/chart-utils';

const HS = {chart: () => {}} as any;

function getChartType(filter: IFilterData, meta: IMeta) {
  if (isDimension(filter.x, meta)) {
    return 'column';
  }
    return 'line';

}

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
    const chartType = getChartType(filter, meta);
    const xAxisType = getXAxisType(filter, meta);

    this.chart = HS.chart(this.container.get(0), {
      title: null,
      credits: {enabled: null},
      chart: {type: chartType},
      legend: {enabled: data.length > 1},
      plotOptions: {
        series: {
          animation: false
        }
      },
      xAxis: {
        type: xAxisType,
        title: {
          text: filter.x
        }
      },
      yAxis: {
        title: {
          text: filter.y.length === 1 ? filter.y[0] : null
        }
      },
      series: data
    });
  }

  public destroy() {
    this.chart.destroy();
  }
}
