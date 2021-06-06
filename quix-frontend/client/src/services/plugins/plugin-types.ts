import {IFile, TModuleComponentType, ModuleEngineType, INote} from '@wix/quix-shared';
import { Time } from '../../config';
import {App} from '../../lib/app';
import formatter from '../../lib/sql-formatter/sqlFormatter';

interface CustomAction {
  icon: string;
  title: string;
  permissions: string;
  handler(note: INote): INote;
}

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
      dateFormat?: string;
      enableQueryFormatter?: boolean;
    },
  ) {
    super(app, id, engine, hooks);

    this.config.dateFormat = this.config.dateFormat || Time.Format;
  }

  getConfig() {
    return this.config;
  }

  formatStats(stats: {[key: string]: any}) {
    return [];
  }

  renderRunner() {
    return `
      <bi-sql-runner
        class="bi-c-h bi-grow bi-fade-in"
        ng-model="textContent"
        ng-change="events.onContentChange(textContent)"
        bsr-options="::{
          fitContent: true,
          params: true,
          focus: options.focusEditor,
          showEditor: options.showEditor,
          showSyntaxErrors: vm.showSyntaxErrors,
          shareParams: options.shareParams,
          autoRun: options.autoRun,
          dateFormat: vm.dateFormat
        }"
        type="vm.type"
        runner="runner"
        download-file-name="actions.getDownloadFileName(query)"
        table-formatter="tableFormatter()"
        on-save="events.onSave()"
        on-run="events.onRun()"
        on-editor-load="events.onEditorInstanceLoad(instance)"
        on-runner-load="events.onRunnerInstanceLoad(instance)"
        on-runner-created="events.onRunnerCreated(runner)"
        on-runner-destroyed="events.onRunnerDestroyed(runner)"
        on-params-share="events.onParamsShare(params)"
        readonly="readonly"
      >
        <controls>
          <quix-npc></quix-npc>
        </controls>

        <stats class="bi-align bi-s-h--x15" bi-html="actions.renderStats()"></stats>
      </bi-sql-runner>
    `;
  }

  getCustomActions(): CustomAction[] {
    const res: CustomAction[] = [];

    if (this.config.enableQueryFormatter) {
      res.push({
        icon: 'format_paint',
        title: 'Format query',
        permissions: 'edit',
        handler: (note: INote) => {
          note.content = formatter.format(note.content, {upperCase: true, language: 'quixsql'});
  
          return note;
        }
      })
    }

    return res;
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
