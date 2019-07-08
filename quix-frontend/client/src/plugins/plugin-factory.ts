import * as DbPlugins from './db';
import * as NotePlugins from './note';

export const pluginFactory = {
  db(id: string) {
    switch (id) {
      case 'presto':
        return new DbPlugins.PrestoDbPlugin(id);
      case 'athena':
        return new DbPlugins.AthenaDbPlugin(id);
      default:
        throw new Error(`No definition for "${id}" db plugin`);
    }
  },

  note(id: string) {
    switch (id) {
      case 'presto':
        return new NotePlugins.PrestoNotePlugin(id);
      case 'athena':
        return new NotePlugins.AthenaNotePlugin(id);
      default:
        throw new Error(`No definition for "${id}" db plugin`);
    }
  }
}