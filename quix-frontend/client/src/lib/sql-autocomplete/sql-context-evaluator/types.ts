import { Column } from "../db-info";

export enum TableType {
  External = 'External',
  Nested = 'Nested',
}

export interface QueryDetails {
  columns: string[];
  selectAll?: boolean;
  tables: TableInfo[];
}

export interface TableInfo {
  type: TableType;
  name: string;
  alias: string;
  columns: (Column | string)[];
  tableRefs: string[];
  selectAll: boolean;
}

export enum ContextType {
  Table = 'Table',
  Column = 'Column',
  Undefined = 'Undefined',
}

export interface QueryContext {
  contextType: ContextType;
  tables: TableInfo[];
  prefix?: string;
}
