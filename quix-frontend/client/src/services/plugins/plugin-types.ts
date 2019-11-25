import { IFile, TModuleComponentType, ModuleEngineType } from '@wix/quix-shared';
import { App } from '../../lib/app';

export const resolvePluginType = (type: TModuleComponentType) => {
  if (PluginMap[type]) {
    return PluginMap[type];
  }

  throw new Error(`"${type}" doesn't mach any known plugin type`);
}

export class Plugin {
  constructor (app: App, protected readonly id: string, protected readonly engine: ModuleEngineType, hooks: any) {
 
  }

  public getId() {
    return this.id;
  }

  public getEngine() {
    return this.engine;
  }
}

export class NotePlugin extends Plugin {
  constructor (app: App, id: string, engine: ModuleEngineType, hooks: any, private readonly config: {
    syntaxValidation: boolean;
    canCreate: boolean;
  }) {
    super(app, id, engine, hooks);
  }

  getConfig() {
    return this.config;
  }
}

export class DbPlugin extends Plugin {
  constructor (app: App, id: string, engine: ModuleEngineType, hooks: any) {
    super(app, id, engine, hooks);
  }

  getSampleQuery(table: IFile): string {
    throw new Error(`No default implementation`);
  }
}

export const PluginMap = {
  note: NotePlugin,
  db: DbPlugin,
}

export type TPluginMap = {[K in keyof typeof PluginMap]: InstanceType<typeof PluginMap[K]>}
