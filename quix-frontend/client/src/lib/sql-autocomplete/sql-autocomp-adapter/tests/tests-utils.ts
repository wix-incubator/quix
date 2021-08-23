import { expect } from 'chai';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { DbInfoService } from '../../db-info';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';

export const runAdapterTest = (
  input: string,
  expected?: ICompleterItem[]
) => {
  const dbInfoService = new DbInfoService('trino', 'https://bo.wix.com/quix');
  const sqlAutocompleterAdapter = new SqlAutocompleter(dbInfoService, evaluateContextFromPosition);
  const position = input.indexOf('|');
  const query = input.replace('|', '');
  const completers = sqlAutocompleterAdapter.getCompleters(query, position);
  it(`it should return comleters = ${expected}`, () => {
    expect(completers).to.be.deep.equal(expected);
  });
};
