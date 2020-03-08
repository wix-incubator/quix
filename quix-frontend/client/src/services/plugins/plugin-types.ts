import {IFile, TModuleComponentType, ModuleEngineType} from '@wix/quix-shared';
import {App} from '../../lib/app';

export const resolvePluginType = (type: TModuleComponentType) => {
  if (PluginMap[type]) {
    return PluginMap[type];
  }

  throw new Error(`"${type}" doesn't mach any known plugin type`);
};

export class Plugin {
  constructor(
    app: App,
    protected readonly id: string,
    protected readonly engine: ModuleEngineType,
    hooks: any,
  ) {}

  public getId() {
    return this.id;
  }

  public getEngine() {
    return this.engine;
  }
}

export class NotePlugin extends Plugin {
  constructor(
    app: App,
    id: string,
    engine: ModuleEngineType,
    hooks: any,
    private readonly config: {
      syntaxValidation: boolean;
      canCreate: boolean;
    },
  ) {
    super(app, id, engine, hooks);
  }

  getRunnerType() {
    return this.getId();
  }

  getConfig() {
    return this.config;
  }

  getDateFormat() {
    return 'YYYY/MM/DD HH:mm';
  }

  formatStats(stats: {[key: string]: any}) {
    return [];
  }

  renderNote(scope: any) {
    return `
      <bi-sql-runner
        class="bi-c-h bi-grow"
        ng-if="::vm.engine !== 'python'"
        ng-model="note.content"
        ng-change="events.onContentChange()"
        bsr-options="::{
          fitContent: true,
          params: true,
          focus: options.focusEditor,
          showSyntaxErrors: vm.showSyntaxErrors,
          shareParams: true,
          autoRun: options.autoRun,
          dateFormat: vm.dateFormat
        }"
        type="vm.type"
        runner="runner"
        download-file-name="getDownloadFileName(query)"
        on-save="events.onSave()"
        on-run="events.onRun()"
        on-editor-load="events.onEditorInstanceLoad(instance)"
        on-runner-load="events.onRunnerInstanceLoad(instance)"
        on-runner-created="events.onRunnerCreated(runner)"
        on-runner-destroyed="events.onRunnerDestroyed(runner)"
        on-params-share="events.onShare(note, params)"
        readonly="!permissions.edit"
      >
        <controls>
          <quix-npc></quix-npc>
        </controls>

        <stats class="bi-align bi-s-h--x15" bi-html="renderStats()"></stats>
      </bi-sql-runner>
    `;
  }
}

export class DbPlugin extends Plugin {
  constructor(app: App, id: string, engine: ModuleEngineType, hooks: any) {
    super(app, id, engine, hooks);
  }

  getSampleQuery(table: IFile): string {
    throw new Error(`No default implementation`);
  }
}

export const PluginMap = {
  note: NotePlugin,
  db: DbPlugin,
};

export type TPluginMap = {
  [K in keyof typeof PluginMap]: InstanceType<typeof PluginMap[K]>;
};
