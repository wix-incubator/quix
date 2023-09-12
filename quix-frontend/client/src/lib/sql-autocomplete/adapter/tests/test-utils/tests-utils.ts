import { expect } from 'chai';
import { ICompleterItem } from '../../../../code-editor/services/code-editor-completer';
import {
  QueryContext,
} from '../../../sql-context-evaluator';
import { SqlAutocompleter } from '../../sql-autocomplete-adapter';
import { MockDbInfoService } from './mock-db-config';

export const runAdapterGetCompletersTest = (
  testnumber: number,
  queryContext: QueryContext,
  expected: ICompleterItem[]
) => {
  const config = new MockDbInfoService();
  const autocomp = new SqlAutocompleter(config);
  it(`test #${testnumber} should return comleters = ${expected}`, async () => {
    const completers = await autocomp.getCompletionItemsFromQueryContext(queryContext);
    expect(completers).to.be.deep.equal(expected);
  });
}
