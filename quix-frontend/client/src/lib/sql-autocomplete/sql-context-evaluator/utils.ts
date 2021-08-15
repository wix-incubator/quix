import { TableInfo, TableType } from './types';

export const createNewTableInfoObj = (
  tableInfo?: Partial<TableInfo>
): TableInfo => ({
  type: TableType.External,
  name: undefined,
  alias: undefined,
  columns: [],
  tableRefs: [],
  selectAll: false,
  ...tableInfo,
});
