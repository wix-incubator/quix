// plugins: '${plugins}'  // e.g. [{id: 'presto', name: 'Presto', modules: ['note', 'db']}, {id: 'athena', name: 'Athena', modules: ['note', 'db']}], fetch some config from backend

export enum ComponentTypes {
  note = 'note',
  db = 'db'
}

interface ComponentConfigurationTypes {
  [ComponentTypes.db]: {};
  [ComponentTypes.note]: {};
}

type ComponentConfiguration = {[K in ComponentTypes]?: ComponentConfigurationTypes[K]}

interface ConfigModule {
  id: string;
  name: string;
  components: ComponentConfiguration;
  syntax: string;
  engine: 'jdbc' | 'presto' | 'athena';
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

  getModuleComponent<C extends ComponentTypes>(id: string, component: C) {
    const m = this.getModule(id);
    return m && m.components[component];
  }

  getModules() {
    return this.config.modules;
  }

  addModule(p: ConfigModule) {
    this.config.modules.push(p);
    return this;
  }

  getModulesByComponent(component: ComponentTypes) {
    return this.config.modules.filter(p => Object.keys(p.components).includes(component));
  }

  addModuleComponent<C extends ComponentTypes>(moduleId: string, component: C, configuration: ComponentConfigurationTypes[C]) {
    const m = this.getModule(moduleId);

    if (m) {
      m.components[component] = configuration;
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