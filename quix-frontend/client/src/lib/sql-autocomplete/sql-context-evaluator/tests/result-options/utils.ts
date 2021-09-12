import { TableType, ContextType, QueryContext } from '../../types';
import { createNewTableInfoObj } from '../../utils';

export type BasicQueryContextOption = {
  [key in ContextType]?: Record<string, QueryContext>;
};

export const testTable = {
  nested: {
    unnamed: createNewTableInfoObj({
      type: TableType.Nested,
    }),
    unnamedWithColumns: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['a', 'b'],
    }),
    table1: createNewTableInfoObj({
      name: 'table1',
      type: TableType.Nested,
      columns: ['foo1', 'bar1'],
    }),
    table1WithRef: createNewTableInfoObj({
      name: 'table1',
      type: TableType.Nested,
      tableRefs: ['externalTable'],
      selectAll: true,
    }),
    table2: createNewTableInfoObj({
      name: 'table2',
      type: TableType.Nested,
      columns: ['foo2', 'bar2'],
    }),
  },
  external: {
    table1: createNewTableInfoObj({
      name: 'table1',
      type: TableType.External,
    }),
    table2: createNewTableInfoObj({
      name: 'table2',
      type: TableType.External,
    }),
    table3: createNewTableInfoObj({
      name: 'table3',
      type: TableType.External,
    }),
  },
};
