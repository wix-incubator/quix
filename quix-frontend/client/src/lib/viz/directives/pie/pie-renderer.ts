import {IMeta, IFilterData} from '../../services/chart/chart-conf';
import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import { default as essos } from '../theme';

echarts.registerTheme('essos', essos);

export class ChartRenderer {
  private chart = null;

  constructor(private readonly container) {

  }

  public error(e) {
    this.container.html(`<div class="bi-center bi-danger">${e}</div>`);
  }

  public draw(data: any[], filteredMeta: IMeta, meta: IMeta, filter: IFilterData) {
    const size = Math.min(this.container.width(),  this.container.height());

    data.forEach((series, i) => {
      const slice = 100 / (data.length * 2);
      series.radius = size / (data.length * 4)
      series.center = [`${(slice * (2 * i + 1))}%`, '50%'];
    })

    this.chart = echarts.init(this.container.get(0), 'essos');
    this.chart.clear();
    this.chart.setOption({
      title: {
        text: null
      },
      legend: {
        show: data.length > 1,
        data: data.map(series => series.name),
        bottom: true
      },
      series: data
    });

    this.chart.resize();
  }

  public destroy() {
    this.chart.dispose();
  }
}
