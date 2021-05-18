import {Injectable} from '@nestjs/common';
import axios from 'axios';
import { isArray } from 'lodash';
import { ConfigService } from '../../../config';

export interface TableAutocompleteItem {
  value: string;
  meta: 'table';
}

@Injectable()
export class AutocompleteService {
  constructor(private configService: ConfigService) {}

  async getAutocompletions(type: string) {
    let backendUrl = this.configService.getEnvSettings().QuixBackendInternalUrl;

    if (['http://', 'https://'].every(s => !backendUrl.startsWith(s))) {
      backendUrl = 'http://' + backendUrl;
    }

    const dbTree = await axios.get(`${backendUrl}/api/db/${type}/explore`);

    return this.flattenTables(dbTree.data);
  }

  flattenTables(
    treeNodes: any[],
    path: string[] = [],
    tables: TableAutocompleteItem[] = [],
  ) {
    if (!isArray(treeNodes)) {
      return tables;
    }

    return treeNodes.reduce<TableAutocompleteItem[]>((res, {name, type, children}: any) => {
      if (type === 'table') {
        res.push({value: [...path, name].join('.'), meta: type});
      } else {
        this.flattenTables(children, [...path, name], res);
      }

      return res;
    }, tables);
  }
}
