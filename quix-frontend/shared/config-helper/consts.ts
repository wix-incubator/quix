export enum ModuleEngineType {
  PRESTO = 'presto',
  ATHENA = 'athena',
  JDBC = 'jdbc',
  BIGQUERY = 'bigquery'
}

export const ModuleEngineToSyntaxMap = {
  presto: 'presto',
  athena: 'athena',
  bigquery: 'ansisql'
}