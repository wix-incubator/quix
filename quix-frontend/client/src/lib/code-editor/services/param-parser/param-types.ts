import BiDate from '../../../../lib/ui/services/date';
import {TPredefindListsTypes} from './params-predefined-types';

export const DATE_FORMAT = BiDate.DATE_FORMAT.replace(/\//g, '-');

export type TType = 'string' | 'number' | 'boolean' | 'option' | 'list' | 'datetime' | 'text';
export const TYPES: TType[] = ['string', 'number', 'boolean', 'option', 'list', 'datetime', 'text'];
export type TUserSelectableTypes = TPredefindListsTypes | TType;

export const TYPE_DEFAULTS = {
  string: null,
  number: null,
  boolean: null,
  option: null,
  list: [],
  datetime: null,
  text: null
};

export const AUTO_PARAMS = [
  'START_TIME',
  'STOP_TIME',
];

export const AUTO_PARAM_TYPES = {
  START_TIME: 'datetime',
  STOP_TIME: 'datetime',
};

export const AUTO_PARAM_DEFAULTS = {
  get START_TIME() {
    return new BiDate(new BiDate().asMoment().utc().subtract(2, 'days').startOf('day').valueOf()).fromUTC().format(DATE_FORMAT);
  },

  get STOP_TIME() {
    return new BiDate(new BiDate().asMoment().utc().startOf('day').valueOf()).fromUTC().format(DATE_FORMAT);
  }
};

export interface IParam {
  key: string;
  type: TType;
  value: any;
  isAutoParam: boolean;
  options?: string[];
}
