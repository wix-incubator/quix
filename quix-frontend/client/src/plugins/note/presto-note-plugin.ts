import {NotePlugin} from '../../services/plugins';

export class PrestoNotePlugin extends NotePlugin {
  constructor(name: string) {
    super(name, {
      syntaxValidation: true,
    });
  }
}