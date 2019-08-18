import * as DbPlugins from './db';
import * as NotePlugins from './note';

export const pluginFactory = {
  db(id: string, engine: string) {
    switch (engine) {
      case 'presto':
        return new DbPlugins.PrestoDbPlugin(id);
      case 'athena':
        return new DbPlugins.AthenaDbPlugin(id);
      case 'jdbc':
        return new DbPlugins.JdbcDbPlugin(id);
      case 'bigquery':
        return new DbPlugins.BigQueryDbPlugin(id);
      default:
        throw new Error(`No definition for "${engine}" engine db plugin`);
    }
  },

  note(id: string, engine: string) {
    switch (engine) {
      case 'presto':
        return new NotePlugins.PrestoNotePlugin(id);
      case 'athena':
        return new NotePlugins.AthenaNotePlugin(id);
      case 'jdbc':
        return new NotePlugins.JdbcNotePlugin(id);
      case 'bigquery':
        return new NotePlugins.BigQueryNotePlugin(id);
      default:
        throw new Error(`No definition for "${engine}" engine note plugin`);
    }
  }
}
