import { runAdapterTest } from './tests-utils';
import { results } from './expected-results';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';
import { DbInfoService, IDbInfoConfig } from '../../db-info';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { expect } from 'chai';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';


// export let dbInfoService : IDbInfoConfig;
// export let sqlAutocompleterAdapter : SqlAutocompleter;

// before(()=>{
//     dbInfoService = new DbInfoService('trino', 'https://bo.wix.com/quix');
//     sqlAutocompleterAdapter = new SqlAutocompleter(dbInfoService, evaluateContextFromPosition);
// });

describe.only('when reciving presto query and a position', () => {
  describe('with nested query', () => {
    describe('And cursor after select', () => {
      const input =
        'select | from (select * from prod.adi.adi_bots_black_list)';
      const expected = results.adi_bots_black_list;
      const dbInfoService = new DbInfoService(
        'trino',
        'https://bo.wix.com/quix'
      );
      const sqlAutocompleterAdapter = new SqlAutocompleter(
        dbInfoService,
        evaluateContextFromPosition
      );
      const position = input.indexOf('|');
      const query = input.replace('|', '');
      const completers = sqlAutocompleterAdapter.getCompleters(query, position);
      it(`it should return comleters = ${expected}`, () => {
        expect(completers).to.be.deep.equal(expected);
      });
    });
  });
});
