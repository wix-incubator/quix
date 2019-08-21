import {DbPlugin} from '../../services/plugins';
import {IFile} from '../../../../shared';
import {DB} from '../../config';
import { App } from '../../lib/app';

export class BigQueryDbPlugin extends DbPlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, hooks);
  }

  getSampleQuery(table: IFile) {
    return `SELECT *
FROM \`${[...table.path, table]}\`
LIMIT ${DB.SampleLimit}
`    
  }
}