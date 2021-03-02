import { ModuleEngineType, ModuleComponentType } from './consts';

interface ComponentConfigurationTypes {
  [ModuleComponentType.Db]: {};
  [ModuleComponentType.Note]: {};
}

export type ComponentConfiguration = {[K in ModuleComponentType]?: ComponentConfigurationTypes[K]}

interface ConfigModule {
  id: string;
  name: string;
  components: ComponentConfiguration;
  syntax: string;
  engine: ModuleEngineType;
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

  getModuleComponent<C extends ModuleComponentType>(id: string, component: C) {
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

  getModulesByComponent(component: ModuleComponentType) {
    return this.config.modules.filter(p => Object.keys(p.components).includes(component));
  }

  addModuleComponent<C extends ModuleComponentType>(moduleId: string, component: C, configuration: ComponentConfigurationTypes[C]) {
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