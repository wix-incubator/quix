import { ContextType, TableType } from '../../types';
import { BasicResultOption } from './utils';
import { testTable } from './utils';

export const basicResult: BasicResultOption = {
  [ContextType.Undefined]: {
    zeroTables: {
      contextType: ContextType.Undefined,
      tables: [],
    },
  },
  [ContextType.Column]: {
    zeroTables: {
      contextType: ContextType.Column,
      tables: [],
    },
    oneExternalTable: {
      contextType: ContextType.Column,
      tables: [testTable.external.table1],
    },
    twoExternalTables: {
      contextType: ContextType.Column,
      tables: [testTable.external.table1, testTable.external.table2],
    },
    twoExternalTablesAndAlias: {
      contextType: ContextType.Column,
      tables: [
        testTable.external.table1,
        { ...testTable.external.table2, alias: 'tbl2' },
      ],
    },
    threeExternalTables: {
      contextType: ContextType.Column,
      tables: [
        testTable.external.table1,
        testTable.external.table2,
        testTable.external.table3,
      ],
    },
  },
  [ContextType.Table]: {
    zeroTables: {
      contextType: ContextType.Table,
      tables: [],
    },
  },
};
