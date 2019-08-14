export enum ModuleEngineType {
  PRESTO = 'presto',
  ATHENA = 'athena',
  JDBC = 'jdbc',
  BIGQUERY = 'bigquery'
}

//TODO: go over this
export const MoudleEngineToSyntaxMap = {
  presto: 'presto',
  athena: 'athena',
  bigquery: 'ansisql'
}