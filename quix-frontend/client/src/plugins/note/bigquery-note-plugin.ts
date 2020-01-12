import { ModuleEngineType } from '@wix/quix-shared';
import { App } from '../../lib/app';
import { NotePlugin } from '../../services/plugins';

export class BigQueryNotePlugin extends NotePlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, ModuleEngineType.BigQuery, hooks, {
      syntaxValidation: true,
      canCreate: true,
    });
  }

  formatStats(stats: {[key: string]: any}) {
    return [{
      title: 'Bytes processed',
      value: stats.bytesProcessed,
    }, {
      title: 'Bytes billed',
      value: stats.bytesBilled,
    }];
  }
}