import {DbPlugin} from '../../services/plugins';
import {DB} from '../../config';
import {IFile} from '../../../../shared';
import {sanitizeTableToken} from '../../services';

export class AthenaDbPlugin extends DbPlugin {
  constructor(name: string) {
    super(name);
  }

  getSampleQuery(table: IFile) {
    return `SELECT *
FROM ${[...table.path, table].map(({name}) => sanitizeTableToken(name, '`')).join('.')}
LIMIT ${DB.SampleLimit}
    `    
  }
}