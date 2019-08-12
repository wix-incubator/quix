import {NotePlugin} from '../../services/plugins';

export class JdbcNotePlugin extends NotePlugin {
  constructor(name: string, hooks: any) {
    super(name, hooks, {
      syntaxValidation: false,
    });
  }
}