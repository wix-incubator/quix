// plugins: '${plugins}'  // e.g. [{id: 'presto', name: 'Presto', modules: ['note', 'dbExplorer']}, {id: 'athena', name: 'Athena', modules: ['note', 'dbExplorer']}], fetch some config from backend

export enum ConfigComponent {
  note = 'note',
  dbExplorer = 'dbExplorer'
}

interface Module {
  id: string,
  name: string,
  componenets: ConfigComponent[]
}


const defaultConfigData = {
  modules: [] as Module[],
  auth: {
    googleClientId: ''
  },
  clientTopology: {
    staticsBaseUrl: '',
    quixBackendUrl: '',
    debug: false,
  },
  options: {
    demoMode: false
  }
}
type ConfigData = typeof defaultConfigData;


export class ClientConfigHelper {
  private readonly config: ConfigData;
  constructor(initialConfig: Partial<ConfigData> = {}) {
    this.config = {...defaultConfigData, ...initialConfig};
  }

  write(): string {
    return JSON.stringify(this.config);
  }

  static load(input: string | object): ClientConfigHelper {
    if (typeof input === 'string') {
      return new ClientConfigHelper(JSON.parse(input));
    }
    return new ClientConfigHelper(input);
  }

  getModule(id: string) {
    return this.getModules().find(m => m.id === id);
  }

  getModules() {
    return this.config.modules;
  }

  addModule(p: Module) {
    this.config.modules.push(p);
    return this;
  }

  getModulesSupportingComponent(module: ConfigComponent) {
    return this.config.modules.filter(p => p.componenets.includes(module));
  }

  addComponentToModule(moduleId: string, component: ConfigComponent) {
    const m = this.getModule(moduleId);
    if (m) {
      m.componenets.push(component);
    }
    return this;
  }

  getAuth() {
    return this.config.auth;
  }

  setAuth(auth: ConfigData['auth']) {
    this.config.auth = {...auth}
    return this;
  }

  getClientTopology() {
    return this.config.clientTopology;
  }

  getOptions() {
    return this.config.options;
  }

  setClientTopology(clientTopology: ConfigData['clientTopology']) {
    this.config.clientTopology = {...clientTopology};
    return this;
  }

  setOptions(options: ConfigData['options']) {
    this.config.options = {...options};
    return this;
  }

}