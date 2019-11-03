import {IMeta, IFilterData} from '../../services/chart/chart-conf';
import {isDimension, isDate} from '../../services/chart/chart-utils';

declare const Plotly;

function getXAxisType(filter: IFilterData, meta: IMeta) {
  if (isDate(filter.x, meta)) {
    return 'date';
  } if (isDimension(filter.x, meta)) {
    return 'bar';
  }
}

export class ChartRenderer {
  private chart = null;

  constructor(private readonly container) {

  }

  public error(e) {
    this.container.html(`<div class="bi-center bi-danger">${e}</div>`);
  }

  public draw(data: any[], filteredMeta: IMeta, meta: IMeta, filter: IFilterData) {
    const xAxisType = getXAxisType(filter, meta);

    data = data.map(serie => ({
      ...serie,
      type: xAxisType,
    }));

    const layout = {
      barmode: 'group',
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
      yaxis: {
        automargin: true,
      },
      xaxis: {
        automargin: true,
        autorange: true,
        type: xAxisType,
      }
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
