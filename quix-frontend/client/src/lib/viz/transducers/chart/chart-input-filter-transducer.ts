import {compose, map} from 'transducers.js';
import {IFilterData, IMeta} from '../../services/chart/chart-conf';
import {ungroup, parseFloats, parseDates, sort} from '../';
import {IInputItem} from '../../services/viz-conf';
import {isDimension} from '../../services/chart/chart-utils';

function sortByContext(filter: IFilterData, meta: IMeta) {
  return sort((a: IInputItem, b: IInputItem) => {
    if (isDimension(filter.x, meta)) {
      return b[filter.y[0]] - a[filter.y[0]];
     } 
      return a[filter.x] - b[filter.x];
     
  });
}

export const inputFilterTransducer = (filter: IFilterData, meta: IMeta) => compose(
  map(input => ({...input})),
  parseDates(meta.dates),
  parseFloats(meta.values),
  ungroup({fields: [filter.x].concat(filter.group), values: filter.y, aggType: filter.aggType}),
  sortByContext(filter, meta)
);
