import {NotePlugin} from '../../services/plugins';

export class BigQueryNotePlugin extends NotePlugin {
  constructor(name: string) {
    super(name, {
      syntaxValidation: true,
    });
  }
}