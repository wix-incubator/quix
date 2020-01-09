export type TModuleComponentType = 'note' | 'db';

export enum ModuleComponentType {
  Note = 'note',
  Db = 'db',
}

export enum ModuleEngineType {
  Presto = 'presto',
  Athena = 'athena',
  Jdbc = 'jdbc',
  BigQuery = 'bigquery',
  Python = 'python',
}

export const ModuleEngineToSyntaxMap = {
  presto: 'presto',
  athena: 'athena',
  bigquery: 'ansisql',
  python: 'python'
}