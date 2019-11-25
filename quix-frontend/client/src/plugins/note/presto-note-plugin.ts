import { ModuleEngineType } from '@wix/quix-shared';
import { App } from '../../lib/app';
import { NotePlugin } from '../../services/plugins';

export class PrestoNotePlugin extends NotePlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, ModuleEngineType.Presto, hooks, {
      syntaxValidation: true,
      canCreate: true,
    });
  }
}