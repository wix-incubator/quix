import {mapValues} from 'lodash';
import {inject, Config} from '../lib/core';
import {IFile, IFolder, INotebook, INote, IUser} from '@wix/quix-shared';

export const config = new Config<{
  apiBasePath: string;
}>();

const api = (endpoint: TemplateStringsArray) => `${config.get().apiBasePath}/api/` + endpoint[0];

const resource = (action: 'get' | 'query', endpoint: string, params: Record<string, any>) =>
  inject('$resource')(endpoint, mapValues(params, (v, k) => `@${k}`))[action](params).$promise;

const one = <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => resource('get', endpoint, params);
const many = <T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> => resource('query', endpoint, params);

export const users = () => many<IUser>(api`users`);
export const files = () => many<IFile>(api`files`);
export const folder = (id: string) => one<IFolder>(api`files/:id`, {id});
export const notebook = (id: string) => one<INotebook>(api`notebook/:id`, {id});
export const favorites = () => many<IFile>(api`favorites`);
export const search = (text: string, offset: number, total: number) => one<{count: number; notes: INote[]}>(api`search/:text`, {
  text,
  offset,
  total
});

export const db = (type: string) => many(api`db/:type/explore`, {type});
export const dbColumns = (type: string, catalog: string, schema: string, table: string) => 
  one(api`db/:type/explore/:catalog/:schema/:table`, {
    type,
    catalog,
    schema,
    table
  });

export const dbSearch = (type: string, q: string) => many(api`db/:type/search`, {type, q});
