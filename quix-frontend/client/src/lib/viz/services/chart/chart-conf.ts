import {IInputItem} from '../viz-conf';

export type IData = IInputItem[];
export interface IMeta extends IFieldCategories {}

export interface IFilterMeta extends IMeta {
  x: string[];
  y: string[];
  group: string[];
}

export interface IFilterData {
  x: string;
  y: string[];
  group: string[];
  aggType: 'sum' | 'avg';
}

export interface IFieldCategories {
  all: string[];
  dimensions: string[];
  values: string[];
  dates: string[];
}

export interface IRendererData {

}
