export type TModuleComponentType = 'note' | 'db';

export enum ModuleComponentType {
  Note = 'note',
  Db = 'db',
}

export enum ModuleEngineType {
  Presto = 'presto',
  Athena = 'athena',
  Jdbc = 'jdbc',
  Rupert = 'rupert',
}

export const ModuleEngineToSyntaxMap = {
  presto: 'presto',
  athena: 'athena',
}