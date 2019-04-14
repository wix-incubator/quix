import {IInputItem} from '../viz-conf';
import {IFieldCategories, IMeta} from './chart-conf';

const getValueType = (value: string): string => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return 'date';
  }  if (!isNaN(value as any) && (!!value || value as any === 0)) {
    return 'value';
  }

  return 'dimension';
};

export const categorizeFields = (input: IInputItem = {}): IFieldCategories => {
  return Object.keys(input || {}).reduce((res, field) => {
    const type = getValueType(input[field]);

    if (type === 'dimension') {
      res.dimensions.push(field);
    } else if (type === 'value') {
      res.values.push(field);
    } else if (type === 'date') {
      res.dates.push(field);
    }

    res.all.push(field);

    return res;
  }, {all: [], dimensions: [], values: [], dates: []});
};

export const isDate = (field: string, meta: IMeta): boolean => {
  return meta.dates.indexOf(field) !== -1;
};

export const isDimension = (field: string, meta: IMeta): boolean => {
  return meta.dimensions.indexOf(field) !== -1;
};
