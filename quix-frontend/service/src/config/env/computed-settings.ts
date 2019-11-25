/* tslint:disable:no-console */
import {ComputedSettings} from './types';
import {ModuleEngineType, ModuleEngineToSyntaxMap} from 'shared';
import {engineToClientComponents} from './engine-settings';

export const computedSettingsDefaults: ComputedSettings = {
  moduleSettings: {
    presto: {
      syntax: 'ansi_sql',
      engine: 'presto',
      components: {db: {}, note: {}},
    },
  },
};

const getModuleSettings = (moduleName: string, globalEnv: any) => {
  const syntaxEnvVar = `MODULES_${moduleName.toUpperCase()}_SYNTAX`;
  const engineEnvVar = `MODULES_${moduleName.toUpperCase()}_ENGINE`;
  let engine = globalEnv[engineEnvVar];
  let syntax: string = '';

  /* backwards compatibility */
  if (engine === undefined) {
    switch (moduleName) {
      case 'presto':
        engine = ModuleEngineType.Presto;
        break;
      case 'athena':
        engine = ModuleEngineType.Athena;
        break;
      default:
    }
  }
  /* end */

  if (!Object.values(ModuleEngineType).includes(engine)) {
    console.error(
      `Bad configuration. Missing or bad 'engine' declaration for module '${moduleName}'. Possible values: ${Object.values(
        ModuleEngineType,
      ).join(',')}`,
    );
    return undefined;
  }

  switch (engine) {
    case ModuleEngineType.Presto:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.Presto];
      break;
    case ModuleEngineType.Athena:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.Athena];
      break;
    case ModuleEngineType.BigQuery:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.BigQuery];
      break;
    case ModuleEngineType.Python:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.BigQuery];
      break;
    default: {
      syntax = globalEnv[syntaxEnvVar] as string;
    }
  }

  if (!syntax) {
    console.error(
      `Bad configuration. Missing 'syntax' declaration for module '${moduleName}'`,
    );
    return undefined;
  }
  const components = engineToClientComponents(engine);
  return {syntax, engine, components};
};

export const getComputedSettings = (
  modules: string[],
  globalEnv: Record<string, string | undefined> = process.env,
): ComputedSettings => {
  const computedSettings: ComputedSettings = computedSettingsDefaults;

  modules.forEach(moduleName => {
    const moduleSettings = getModuleSettings(moduleName, globalEnv);

    if (moduleSettings) {
      computedSettings.moduleSettings[moduleName] = moduleSettings;
    }
  });
  return computedSettings;
};
