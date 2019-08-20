import {IMeta, IFilterData} from '../../services/chart/chart-conf';

declare const Plotly;

export class PieRenderer {
  private chart = null;

  constructor(private readonly container) {

  }

  public error(e) {
    this.container.html(`<div class="bi-center bi-danger">${e}</div>`);
  }

  public draw(data: any[], filteredMeta: IMeta, meta: IMeta, filter: IFilterData) {
    const xAxisType = 'pie';

    data = data.map(serie => ({
      ...serie,
      type: xAxisType,
      labels: serie.x,
      values: serie.y,
    }));

    const layout = {
      margin: {
        l: 30,
        r: 30,
        b: 30,
        t: 30,
        pad: 4,
      },
      legend: {
        'orientation': 'v',
      },
    };

    if (this.chart) {
      this.destroy();
    }

    this.chart = Plotly.newPlot(this.container.get(0), data, layout, {
      displaylogo: false,
    });
  }

  public destroy() {
    Plotly.purge(this.container.get(0));
  }
}
