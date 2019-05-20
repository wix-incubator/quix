import {mapValues} from 'lodash';
import {inject} from '../lib/core';
import {IFile, IFolder, INotebook, INote} from '../../../shared';

const resource = ( action: 'get' | 'query', endpoint: string, params: Record<string, any>) => 
  inject('$resource')(endpoint, mapValues(params, (v, k) => `@${k}`))[action](params).$promise;

const one = <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => resource('get', endpoint, params);
const many = <T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> => resource('query', endpoint, params);

export const users = () => many<IFile>('/api/users');
export const files = () => many<IFile>('/api/files');
export const folder = (id: string) => one<IFolder>('/api/files/:id', {id});
export const notebook = (id: string) => one<INotebook>('/api/notebook/:id', {id});
export const favorites = () => many<IFile>('/api/favorites');
export const search = (text: string) => many<INote>('/api/search/:text', {text});
export const db = () => many('/api/db/explore');
export const dbColumns = (catalog: string, schema: string, table: string) => one('/api/db/explore/:catalog/:schema/:table', {
  catalog,
  schema,
  table
});