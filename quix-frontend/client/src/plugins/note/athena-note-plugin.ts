import { App } from '../../lib/app';
import {NotePlugin} from '../../services/plugins';

export class AthenaNotePlugin extends NotePlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, hooks, {
      syntaxValidation: true,
      canCreate: true,
    });
  }
}