import {App} from '../lib/app';
import { Store } from '../lib/store';
import * as DbPlugins from './db';
import * as NotePlugins from './note';

export const pluginFactory = {
  db(app: App, store: Store, id: string, engine: string, noteHooks: any) {
    switch (engine) {
      case 'presto':
        return new DbPlugins.PrestoDbPlugin(app, id, noteHooks);
      case 'athena':
        return new DbPlugins.AthenaDbPlugin(app, id, noteHooks);
      case 'jdbc':
        return new DbPlugins.JdbcDbPlugin(app, id, noteHooks);
      case 'bigquery':
        return new DbPlugins.BigQueryDbPlugin(app, id, noteHooks);
      default:
        throw new Error(`No definition for "${engine}" engine db plugin`);
    }
  },

  note(app: App, store: Store, id: string, engine: string, noteHooks: any) {
    switch (engine) {
      case 'presto':
        return new NotePlugins.PrestoNotePlugin(app, id, noteHooks);
      case 'athena':
        return new NotePlugins.AthenaNotePlugin(app, id, noteHooks);
      case 'jdbc':
        return new NotePlugins.JdbcNotePlugin(app, id, noteHooks);
      case 'bigquery':
        return new NotePlugins.BigQueryNotePlugin(app, id, noteHooks);
      case 'python':
        return new NotePlugins.PythonNotePlugin(app, id, noteHooks);
      default:
        return noteHooks.plugin.call(app, store, engine, id) || new NotePlugins.DefaultNotePlugin(app);
    }
  },
};
