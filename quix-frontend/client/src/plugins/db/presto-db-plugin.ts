import { App } from '../../lib/app';
import {DbPlugin} from '../../services/plugins';
import {IFile} from '@wix/quix-shared';
import {DB} from '../../config';
import {sanitizeTableToken} from '../../services';

export class PrestoDbPlugin extends DbPlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, hooks);
  }

  getSampleQuery(table: IFile) {
    return `SELECT *
FROM ${[...table.path, table].map(({name}) => sanitizeTableToken(name, '"')).join('.')}
LIMIT ${DB.SampleLimit}
`    
  }
}