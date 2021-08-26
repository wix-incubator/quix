import { expect } from 'chai';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { DbInfoService } from '../../db-info';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';

export const runAdapterTest = (
  input: string,
  expected: ICompleterItem[]
) => {
  const dbInfoService = new DbInfoService('trino', 'https://bo.wix.com/quix');
  const sqlAutocompleterAdapter = new SqlAutocompleter(dbInfoService, evaluateContextFromPosition);
  const position = input.indexOf('|');
  const query = input.replace('|', ' ');
  it(`on input ${input} it should return comleters = ${expected}`, async () => {
    const completers = await sqlAutocompleterAdapter.getCompleters(query, position);
    // console.log('\ncompleters\n', completers)
    // console.log('\nexpected\n', expected)

    expect(completers).to.be.deep.equal(expected);
  });
};
