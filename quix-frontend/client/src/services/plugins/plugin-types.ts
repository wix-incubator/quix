import { IFile, TModuleComponentType } from '@wix/quix-shared';
import { App } from '../../lib/app';

export const resolvePluginType = (type: TModuleComponentType) => {
  if (PluginMap[type]) {
    return PluginMap[type];
  }

  throw new Error(`"${type}" doesn't mach any known plugin type`);
}

export class Plugin {
  protected type: string;

  constructor (app: App, protected readonly id: string, hooks: any) {
    this.type = id;    
  }

  public getId() {
    return this.id;
  }

  public getType() {
    return this.type;
  }
}

export class NotePlugin extends Plugin {
  constructor (app: App, id: string, hooks: any, private readonly config: {
    syntaxValidation: boolean;
    canCreate: boolean;
  }) {
    super(app, id, hooks);
  }

  getConfig() {
    return this.config;
  }
}

export class DbPlugin extends Plugin {
  constructor (app: App, id: string, hooks: any) {
    super(app, id, hooks);
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
