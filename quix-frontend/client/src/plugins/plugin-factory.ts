import * as DbPlugins from './db';
import * as NotePlugins from './note';

export const pluginFactory = {
  db(engine: string) {
    switch (engine) {
      case 'presto':
        return new DbPlugins.PrestoDbPlugin(engine);
      case 'athena':
        return new DbPlugins.AthenaDbPlugin(engine);
      default:
        throw new Error(`No definition for "${engine}" engine db plugin`);
    }
  },

  note(engine: string) {
    switch (engine) {
      case 'presto':
        return new NotePlugins.PrestoNotePlugin(engine);
      case 'athena':
        return new NotePlugins.AthenaNotePlugin(engine);
      default:
        throw new Error(`No definition for "${engine}" engine note plugin`);
    }
  }
}