import { ContextType } from '../../types';
import { BasicResultOption, testTable } from './utils';

export const nestedResult: BasicResultOption = {
  [ContextType.Column]: {
    oneNested: {
      contextType: ContextType.Column,
      tables: [testTable.nested.unnamedWithColumns],
    },
    oneNestedWithRefs: {
      contextType: ContextType.Column,
      tables: [
        {
          ...testTable.nested.unnamed,
          columns: [],
          tableRefs: ['A', 'B'],
          selectAll: true,
        },
      ],
    },
    oneNestedWithOneRef: {
      contextType: ContextType.Column,
      tables: [
        { ...testTable.nested.unnamed, tableRefs: ['table1'], selectAll: true },
      ],
    },
    oneNestedWithRefAndColumn: {
      contextType: ContextType.Column,
      tables: [
        {
          ...testTable.nested.unnamed,
          columns: ['foo'],
          tableRefs: ['table1'],
          selectAll: true,
        },
      ],
    },
    oneNestedWithAlias: {
      contextType: ContextType.Column,
      tables: [{ ...testTable.nested.unnamedWithColumns, alias: 'tbl1' }],
    },
    oneNestedWithAliasAndRefs: {
      contextType: ContextType.Column,
      tables: [
        {
          ...testTable.nested.unnamed,
          alias: 'tbl1',
          tableRefs: ['A', 'B'],
          selectAll: true,
        },
      ],
    },
    oneExtOneNested: {
      contextType: ContextType.Column,
      tables: [testTable.external.table1, testTable.nested.unnamedWithColumns],
    },
    oneExtOneNestedWithAlias: {
      contextType: ContextType.Column,
      tables: [
        testTable.external.table1,
        { ...testTable.nested.unnamedWithColumns, alias: 'tbl2' },
      ],
    },
    oneExtOneNestedWithAliasAndRefs: {
      contextType: ContextType.Column,
      tables: [
        testTable.external.table1,
        {
          ...testTable.nested.unnamed,
          alias: 'tbl2',
          tableRefs: ['A', 'B'],
          selectAll: true,
        },
      ],
    },
    oneExtOneNestedAndRefs: {
      contextType: ContextType.Column,
      tables: [
        testTable.external.table1,
        { ...testTable.nested.unnamed, tableRefs: ['A', 'B'], selectAll: true },
      ],
    },
    twoNestedOneWithRefsAndAlias: {
      contextType: ContextType.Column,
      tables: [
        {
          ...testTable.nested.unnamed,
          alias: 'tbl1',
          tableRefs: ['A', 'B'],
          selectAll: true,
        },
        testTable.nested.unnamedWithColumns,
      ],
    },
  },
};
