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
        ng-model="note.content"
        ng-change="events.onContentChange()"
        bpr-options="::{
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
      </bi-python-runner>
    `;
  }
}
