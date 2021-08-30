import { expect } from 'chai';
import { ICompleterItem } from '../../../../code-editor/services/code-editor-completer';
import { DbInfoService } from '../../../db-info/db-info-service';
import {
  evaluateContextFromPosition, QueryContext,
} from '../../../sql-context-evaluator';
import { SqlAutocompleter } from '../../sql-autocomplete-adapter';
import { MockDbInfoService } from './mock-db-config';

export const runAdapterIntegrationTest = (input: string, expected: ICompleterItem[]) => {
  const dbInfoService = new DbInfoService('trino', 'https://bo.wix.com/quix');
  const sqlAutocompleterAdapter = new SqlAutocompleter(
    dbInfoService,
  );
  const position = input.indexOf('|');
  const query = input.replace('|', ' ');
  const queryContext = evaluateContextFromPosition(query, position)
  it(`on input ${input} it should return comleters = ${expected}`, async () => {
    const completers = await sqlAutocompleterAdapter.getCompletionItemsFromQueryContext(
      queryContext,
    );
    // console.log('\ncompleters\n', completers)
    // console.log('\nexpected\n', expected)

    expect(completers).to.be.deep.equal(expected);
  });
};

export const runAdapterGetCompleters = (queryContext: QueryContext, expected: ICompleterItem[]) => {
  const dbInfoService = new MockDbInfoService();
  const sqlAutocompleterAdapter = new SqlAutocompleter(
    dbInfoService,
  );
  it(`it should return comleters = ${expected}`, async () => {
    const completers = await sqlAutocompleterAdapter.getCompletionItemsFromQueryContext(
      queryContext,
    );
    // console.log('\ncompleters\n', completers)
    // console.log('\nexpected\n', expected)
    expect(completers).to.be.deep.equal(expected);
  });
};


