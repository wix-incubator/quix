import {IFile} from '../../../../shared';

export type PluginType = 'note' | 'db';

export const resolvePluginType = (type: PluginType) => {
  if (PluginMap[type]) {
    return PluginMap[type];
  }

  throw new Error(`Unsupported plugin type "${type}"`);
}

export class Plugin {
  constructor (protected readonly id: string) {
    
  }

  public getId() {
    return this.id;
  }
}

export class NotePlugin extends Plugin {
  constructor (id: string, private readonly config: {
    syntaxValidation: boolean;
  }) {
    super(id);
  }

  getConfig() {
    return this.config;
  }
}

export class DbPlugin extends Plugin {
  constructor (id: string) {
    super(id);
  }

  getSampleQuery(table: IFile): string {
    throw new Error(`No default implementation`);
  }
}

export const PluginMap = {
  'note': NotePlugin,
  'db': DbPlugin,
}

export type TPluginMap = {[K in keyof typeof PluginMap]: InstanceType<typeof PluginMap[K]>}
