import {ModuleEngineType, ComponentConfiguration} from '@wix/quix-shared';

export const engineToClientComponents = (engine: string) => {
  return moduleToComponentsMap[engine as ModuleEngineType] || {};
};

const moduleToComponentsMap: Record<
  ModuleEngineType,
  ComponentConfiguration
> = {
  [ModuleEngineType.Athena]: {db: {}, note: {}},
  [ModuleEngineType.BigQuery]: {db: {}, note: {}},
  [ModuleEngineType.Jdbc]: {db: {}, note: {}},
  [ModuleEngineType.Presto]: {db: {}, note: {}},
  [ModuleEngineType.Python]: {note: {}},
};
