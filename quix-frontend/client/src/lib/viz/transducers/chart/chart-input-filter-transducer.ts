import {pick} from 'lodash';
import {compose, map} from 'transducers.js';
import {IFilterData, IMeta} from '../../services/chart/chart-conf';
import {ungroup, parseFloats, sort} from '../';
import {IInputItem} from '../../services/viz-conf';
import {isDimension} from '../../services/chart/chart-utils';
import {parseDates} from '../parse-dates-transducer';

function sortByContext(filter: IFilterData, meta: IMeta) {
  return sort((a: IInputItem, b: IInputItem) => {
    if (isDimension(filter.x, meta)) {
      return b[filter.y[0]] - a[filter.y[0]];
    }

    return a[filter.x] - b[filter.x];
  });
}

export const inputFilterTransducer = (filter: IFilterData, meta: IMeta) => {
  const fields = [filter.x, ...filter.group];
  const values = filter.y;
  const all = [...fields, ...values];

  return compose(
    map(input => pick(input, all)),
    parseDates(meta.dates),
    parseFloats(meta.values),
    ungroup({fields, values, aggType: filter.aggType}),
    sortByContext(filter, meta)
  );
};
