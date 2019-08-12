import {NotePlugin} from '../../services/plugins';

export class PrestoNotePlugin extends NotePlugin {
  constructor(name: string, hooks: any) {
    super(name, hooks, {
      syntaxValidation: true,
    });
  }
}