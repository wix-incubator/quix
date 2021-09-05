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
    unnamedWith2Columns12AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col1', 'col2'],
      alias: 'tblAlias2',
    }),
    unnamedWith2Columns34AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col3', 'col4'],
      alias: 'tblAlias1',
    }),
    unnamedWith2Columns34AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      columns: ['col3', 'col4'],
      alias: 'tblAlias2',
    }),
    unnamedWith1TableRef1: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
    }),
    unnamedWith1TableRef2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
    }),
    unnamedWith1TblRef1And2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
      columns: ['col1', 'col2'],
    }),
    unnamedWith1TblRef2And2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
      columns: ['col1', 'col2'],
    }),
    unnamedWith2TblRefs: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1', 'ctl2.schm2.tblRef2'],
    }),
    unnamedWith1TblRef1And2Columns12AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
      columns: ['col1', 'col2'],
      alias: 'tblAlias1',
    }),
    unnamedWith1TblRef2And2Columns12AndAlias: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
      columns: ['col1', 'col2'],
      alias: 'tblAlias1',
    }),
    unnamedWith1TblRef1And2Columns12AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
      columns: ['col1', 'col2'],
      alias: 'tblAlias2',
    }),
    unnamedWith1TblRef2And2Columns12AndAlias2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
      columns: ['col1', 'col2'],
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
    namedWithTblRef1: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
      name: 'tblName1',
    }),
    namedWithTblRef2: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
      name: 'tblName1',
    }),
    namedWith1TblRef1And2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
      columns: ['col1', 'col2'],
      name: 'tblName1',
    }),
    namedWith1TblRef2And2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
      columns: ['col1', 'col2'],
      name: 'tblName1',
    }),
    named2With1TblRef1And2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1'],
      columns: ['col1', 'col2'],
      name: 'tblName2',
    }),
    named2With1TblRef2And2Columns12: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef2'],
      columns: ['col1', 'col2'],
      name: 'tblName2',
    }),
    namedWith2TblRefs: createNewTableInfoObj({
      type: TableType.Nested,
      tableRefs: ['ctl1.schm1.tblRef1', 'ctl2.schm2.tblRef2'],
      name: 'tblName1',
    }),
  },

  external: {
    ext: createNewTableInfoObj({
      name: 'ctl1.schm1.extTbl1',
    }),
    extWithAlias: createNewTableInfoObj({
      name: 'ctl1.schm1.extTbl1',
      alias: 'tblAlias1',
    }),
    extWithAlias2: createNewTableInfoObj({
      name: 'ctl1.schm1.extTbl1',
      alias: 'tblAlias2',
    }),
  },
};
