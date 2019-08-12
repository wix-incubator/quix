import * as DbPlugins from './db';
import * as NotePlugins from './note';

export const pluginFactory = {
  db(id: string, engine: string, hooks: any) {
    switch (engine) {
      case 'presto':
        return new DbPlugins.PrestoDbPlugin(id, hooks);
      case 'athena':
        return new DbPlugins.AthenaDbPlugin(id, hooks);
      case 'jdbc':
        return new DbPlugins.JdbcDbPlugin(id, hooks);
      default:
        throw new Error(`No definition for "${engine}" engine db plugin`);
    }
  },

  note(id: string, engine: string, hooks: any) {
    switch (engine) {
      case 'presto':
        return new NotePlugins.PrestoNotePlugin(id, hooks);
      case 'athena':
        return new NotePlugins.AthenaNotePlugin(id, hooks);
      case 'jdbc':
        return new NotePlugins.JdbcNotePlugin(id, hooks);
      case 'rupert':
        return new NotePlugins.RupertNotePlugin(id, hooks);
      default:
        throw new Error(`No definition for "${engine}" engine note plugin`);
    }
  }
}