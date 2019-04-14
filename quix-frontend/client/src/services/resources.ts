import {mapValues} from 'lodash';
import {inject} from '../lib/core';

const resource = ( action: 'get' | 'query', endpoint: string, params: Record<string, any>) => 
  inject('$resource')(endpoint, mapValues(params, (v, k) => `@${k}`))[action](params).$promise;

const one = (endpoint: string, params: Record<string, any> = {}) => resource('get', endpoint, params);
const many = (endpoint: string, params: Record<string, any> = {}) => resource('query', endpoint, params);

export const files = () => many('/api/files');
export const favorites = () => many('/api/favorites');
export const notebook = (id: string) => one('/api/notebook/:id', {id});
export const search = (text: string) => many('/api/search/:text', {text});
export const db = () => many('/api/db/explore');