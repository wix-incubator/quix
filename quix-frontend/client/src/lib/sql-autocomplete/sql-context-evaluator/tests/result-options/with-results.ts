import { ContextType } from '../../types';
import { BasicQueryContextOption } from '../result-options/utils';
import { testTable } from './utils';

export const withResult: BasicQueryContextOption = {
  [ContextType.Column]: {
    oneWithTable: {
      contextType: ContextType.Column,
      tables: [testTable.nested.table1],
    },
    oneWithTableWithNameAndOneRef: {
      contextType: ContextType.Column,
      tables: [testTable.nested.table1WithRef],
    },
    oneWithTableAliased: {
      contextType: ContextType.Column,
      tables: [{ ...testTable.nested.table1, alias: 'tbl1' }],
    },
    oneWithTableAndRef: {
      contextType: ContextType.Column,
      tables: [testTable.nested.table1WithRef],
    },
    twoWithTables: {
      contextType: ContextType.Column,
      tables: [testTable.nested.table1, testTable.nested.table2],
    },
    oneWithOneExternalTables: {
      contextType: ContextType.Column,
      tables: [testTable.nested.table1, testTable.external.table2],
    },
  },
  [ContextType.Table]: {
    oneWithTable: {
      contextType: ContextType.Table,
      tables: [testTable.nested.table1],
    },
    oneWithTableAndRef: {
      contextType: ContextType.Table,
      tables: [testTable.nested.table1WithRef],
    },
    twoWithTables: {
      contextType: ContextType.Table,
      tables: [testTable.nested.table1, testTable.nested.table2],
    },
  },
};
