import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { TableInfo } from '../sql-context-evaluator';
import { Column } from './types';

export const getQueryContextColumns = (
  tables: TableInfo[],
  completionItem: ICompleterItem,
  completers: Set<ICompleterItem>,
  getColumnList: (Name: string) => Promise<Column[]>
) => {
  tables.forEach((table) => {
    const { name, alias, columns, tableRefs } = table;
    tableRefs.forEach(async (tableRef) => {
      (await (getColumnList(tableRef))).forEach((column) => {
        columns.push(column.name);
      });
    });
    columns.forEach((column) => {
      completionItem.value = column;
      completers.add({ ...completionItem });
      const completerName: string = alias
        ? `${alias}.${column}`
        : name
        ? `${name}.${column}`
        : undefined;
      if (completerName) {
        completionItem.value = completerName;
        completers.add({ ...completionItem });
      }
    });
  });
};

export const getQueryContextTables = (
  tables: TableInfo[],
  completionItem: ICompleterItem,
  completers: Set<ICompleterItem>
) => {
  tables.forEach((table) => {
    completionItem.value = table.name;
    completers.add({ ...completionItem });
  });
};


