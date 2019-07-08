// plugins: '${plugins}'  // e.g. [{id: 'presto', name: 'Presto', modules: ['note', 'db']}, {id: 'athena', name: 'Athena', modules: ['note', 'db']}], fetch some config from backend

export enum ConfigComponent {
  note = 'note',
  db = 'db'
}

interface ConfigModule {
  id: string;
  name: string;
  components: ConfigComponent[];
}

const defaultConfigData = {
  modules: [] as ConfigModule[],
  auth: {
    googleClientId: '',
  },
  clientTopology: {
    staticsBaseUrl: '',
    executeBaseUrl: '',
    apiBasePath: '',
  },
  mode: {
    debug: false,
    demo: false,
  }
}

type ConfigData = typeof defaultConfigData;

export class ClientConfigHelper {
  private readonly config: ConfigData;

  constructor(initialConfig: Partial<ConfigData> = {}) {
    this.config = {
      ...defaultConfigData, 
      ...initialConfig
    };
  }

  serialize(): string {
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

  addModule(p: ConfigModule) {
    this.config.modules.push(p);
    return this;
  }

  getModulesByComponent(component: ConfigComponent) {
    return this.config.modules.filter(p => p.components.includes(component));
  }

  addModuleComponent(moduleId: string, component: ConfigComponent) {
    const m = this.getModule(moduleId);

    if (m) {
      m.components.push(component);
    }

    return this;
  }

  getAuth() {
    return this.config.auth;
  }

  getClientTopology() {
    return this.config.clientTopology;
  }

  getMode() {
    return this.config.mode;
  }

  setAuth(auth: ConfigData['auth']) {
    this.config.auth = {...auth}
    return this;
  }

  setClientTopology(clientTopology: ConfigData['clientTopology']) {
    this.config.clientTopology = {...clientTopology};
    return this;
  }

  setMode(mode: ConfigData['mode']) {
    this.config.mode = {...mode};
    return this;
  }
}