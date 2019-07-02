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
  constructor(private readonly basePath = '') {}

  fetchAllKeywords(): Promise<IAutocomplete[]> {
    return this.$http<any>({
      url: this.basePath + `/api/db/autocomplete`,
      method: 'GET'
    })
      .then(({data}) => Object.keys(data).reduce((res, meta) => {
        data[meta].forEach((value: string) => res.push({meta, value}));
        return res;
      }, []))
      .catch(e => console.log(e)) as any;
  }

  fetchSchema(): Promise<IDbNode[]> {
    return this.$http<any>({
      url: this.basePath + `/api/db/explore`,
      method: 'GET'
    })
      .then(({data}) => data)
      .catch(e => []) as any;
  }
}
