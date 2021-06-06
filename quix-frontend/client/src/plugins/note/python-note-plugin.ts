import { ModuleEngineType } from '@wix/quix-shared';
import { App } from '../../lib/app';
import { NotePlugin } from '../../services/plugins';

export class PythonNotePlugin extends NotePlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, ModuleEngineType.Python, hooks, {
      syntaxValidation: true,
      canCreate: true,
    });
  }

  renderRunner() {
    return `
      <bi-python-runner
        class="bi-c-h bi-grow bi-fade-in"
        ng-model="textContent"
        ng-change="events.onContentChange(textContent)"
        bpr-options="::{
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
      </bi-python-runner>
    `;
  }
}
