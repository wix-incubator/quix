import bytes from 'bytes';
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
    const bytesConfig = {thousandsSeparator: ',', unitSeparator: ' ', decimalPlaces: 0};

    return [{
      title: 'Cache',
      value: stats.cacheHit ? 'Hit' : 'Miss',
    }, {
      title: 'Bytes processed',
      value: bytes(stats.bytesProcessed, bytesConfig),
    }, {
      title: 'Bytes billed',
      value: bytes(stats.bytesBilled, bytesConfig),
    }];
  }

  getDateFormat() {
    return 'YYYY/MM/DD HH:mm:ss';
  }
}