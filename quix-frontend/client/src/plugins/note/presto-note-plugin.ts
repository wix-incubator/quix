import { INote, ModuleEngineType } from '@wix/quix-shared';
import { App } from '../../lib/app';
import { NotePlugin } from '../../services/plugins';
import formatter from '../../lib/sql-formatter/sqlFormatter';

export class PrestoNotePlugin extends NotePlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, ModuleEngineType.Presto, hooks, {
      syntaxValidation: true,
      canCreate: true,
    });
  }

  getCustomActions() {
    return [{
      icon: 'format_paint',
      title: 'Format',
      handler: (note: INote) => {
        note.content = formatter.format(note.content);
      }
    }];
  }
}