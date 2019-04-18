'use strict';
import {inject} from '../../../core';
import angular from 'angular';

export interface IAutocomplete {
  value: string;
  meta: string;
}

export interface IDbNode {
  name: string;
  type: string;
  children: IDbNode[];
}

export class DbInfo {
  private readonly $http: angular.IHttpService = inject('$http');

  fetchAllKeywords(): Promise<IAutocomplete[]> {
    return this.$http<any>({
      url: `/api/db/autocomplete`,
      method: 'GET'
    }).then(data => data.data.payload || data.data).catch(e => []) as any;
  }

  fetchSchema(): Promise<IDbNode[]> {
    return this.$http<any>({
      url: `/api/db/explore`,
      method: 'GET'
    }).then(data => data.data.payload || data.data).catch(e => []) as any;
  }
}
