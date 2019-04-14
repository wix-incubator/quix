import {mapValues} from 'lodash';

export type ExtractActions<T extends Record<string, (...args: any[]) => any>> = {[K in keyof T]: ReturnType<T[K]>}[keyof T];
export type ExtractActionTypes<T extends Record<string, (...args: any[]) => any>> = {[K in keyof T]: ReturnType<T[K]>['type']}[keyof T];
export const ExtractActionTypes = <T extends Record<string, (...args: any[]) => any>>(actions: T) => {
  const result: {[K in keyof T]: ReturnType<T[K]>['type']} = mapValues(actions, ((actionCreator: Function) => actionCreator().type)) as any;
  return result;
} 
