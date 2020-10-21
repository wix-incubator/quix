import {ModuleEngineType} from '@wix/quix-shared';
import {NotePlugin} from '../../services/plugins';

export class DefaultNotePlugin extends NotePlugin {
  constructor(app) {
    super(
      app,
      'default',
      ModuleEngineType.Presto,
      {},
      {
        syntaxValidation: false,
        canCreate: false,
      },
    );
  }
}
