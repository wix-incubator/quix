import { TableType } from '../../../../sql-context-evaluator/types';
import { createNewTableInfoObj } from '../../../../sql-context-evaluator/utils';

export const testTable = {
  nested: {
    emptyUnnamed: createNewTableInfoObj({
      type: TableType.Nested,
    }),
    unnamedWith2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col1', 'col2'],
    }),
    unnamedWith2Columns34: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col3', 'col4'],
    }),
    unnamedWith2Columns56: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col5', 'col6'],
    }),
    unnamedWith2Columns12AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col1', 'col2'],
      alias: 'tblAlias1',
    }),
    unnamedWith2Columns34AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col3', 'col4'],
      alias: 'tblAlias1',
    }),
    unnamedWith2Columns56AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col5', 'col6'],
      alias: 'tblAlias1',
    }),
    unnamedWith2Columns12AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col1', 'col2'],
      alias: 'tblAlias2',
    }),
    unnamedWith2Columns34AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col3', 'col4'],
      alias: 'tblAlias2',
    }),
    unnamedWith1TableRefs: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
    }),
    unnamedWith2TableRefs: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1', 'ctl2.schm2.tbl2'],
    }),
    unnamedWith1TableRefsAnd2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col1', 'col2'],
    }),
    unnamedWith1TableRefsAnd2Columns34: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col3', 'col4'],
    }),
    unnamedWith1TableRefsAnd2Columns56: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col5', 'col6'],
    }),
    unnamedWith1TableRefsAnd2Columns12AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col1', 'col2'],
      alias: 'tblAlias1',
    }),
    unnamedWith1TableRefsAnd2Columns34AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col3', 'col4'],
      alias: 'tblAlias1',
    }),
    unnamedWith1TableRefsAnd2Columns56AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col5', 'col6'],
      alias: 'tblAlias1',
    }),
    unnamedWith1TableRefsAnd2Columns12AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col1', 'col2'],
      alias: 'tblAlias2',
    }),
    unnamedWith1TableRefsAnd2Columns34AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col3', 'col4'],
      alias: 'tblAlias2',
    }),
    unnamedWith1TableRefsAnd2Columns56AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col5', 'col6'],
      alias: 'tblAlias2',
    }),
  },

  withTable: {
    namedWith2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      name: 'tblName1',
      columns: ['col1', 'col2'],
    }),
    namedWith2Columns34: createNewTableInfoObj({
      type: TableType.Nested,
      name: 'tblName1',
      columns: ['col3', 'col4'],
    }),
    namedWith2Columns56: createNewTableInfoObj({
      type: TableType.Nested,
      name: 'tblName1',
      columns: ['col3', 'col4'],
    }),
    namedWithTableRef: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      name: 'tblName1',
    }),
    namedWithTableRefs: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1', 'ctl2.schm2.tbl2'],
      name: 'tblName1',
    }),
    namedWith1TableRefsAnd2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col1', 'col2'],
      name: 'tblName1',
    }),
    namedWith1TableRefsAnd2Columns34: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col3', 'col4'],
      name: 'tblName1',
    }),
    namedWith1TableRefsAnd2Columns56: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col5', 'col6'],
      name: 'tblName1',
    }),
    named2With1TableRefsAnd2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col1', 'col2'],
      name: 'tblName2',
    }),
    named2With1TableRefsAnd2Columns34: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col3', 'col4'],
      name: 'tblName2',
    }),
    named2With1TableRefsAnd2Columns56: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tbl1'],
      columns: ['col5', 'col6'],
      name: 'tblName2',
    }),
  },

  external: {
    ext: createNewTableInfoObj({
      name: 'ctl1.schm1.tbl1',
    }),
    extwithAlias: createNewTableInfoObj({
      name: 'ctl1.schm1.tbl1',
      alias: 'tblAlias1',
    }),
    extwithAlias2: createNewTableInfoObj({
      name: 'ctl1.schm1.tbl1',
      alias: 'tblAlias2',
    }),
  },
};
