export enum ModuleEngineType {
  PRESTO = 'presto',
  ATHENA = 'athena',
  JDBC = 'jdbc'
}

export const ModuleEngineToSyntaxMap = {
  presto: 'presto',
  athena: 'athena'
}