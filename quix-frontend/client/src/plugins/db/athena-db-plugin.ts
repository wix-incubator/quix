import {DbPlugin} from '../../services/plugins';
import {DB} from '../../config';
import {IFile} from '../../../../shared';

export class AthenaDbPlugin extends DbPlugin {
  constructor(name: string) {
    super(name);
  }

  getSampleQuery(table: IFile) {
    return `SELECT *
FROM ${[...table.path.slice(1), table].map(({name}) => `\`${name}\``).join('.')}
LIMIT ${DB.SampleLimit}
    `    
  }
}