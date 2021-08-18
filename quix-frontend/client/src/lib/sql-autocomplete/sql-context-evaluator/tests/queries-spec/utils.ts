import { expect } from 'chai';
import { ICompleterItem } from '../../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from '../../../sql-autocomp-adapter/sql-autocomplete-adapter';
import { IContextEvaluator, IDbConfiguration } from '../../../sql-autocomp-adapter/types';
import evaluateContextFromPosition from '../../position-evaluator';
import { QueryContext } from '../../types';

export interface TestCase {
  input: string;
  expected: QueryContext;
}

const getContext = (input: string) => {
  return evaluateContextFromPosition(
    input.replace('|', ''),
    input.indexOf('|')
  );
};

export const runQueryTest = (
  input: TestCase | TestCase[] | string,
  expected?: QueryContext
): void => {
  const tests =
    typeof input === 'string'
      ? [{ input, expected }]
      : input instanceof Array
      ? input
      : [input];

  tests.forEach((test: TestCase) => {
    it(`it should return contextType ${test.expected.contextType} and ${test.expected.tables.length} table info.
    input: '${test.input}'`, () => {
      const results: QueryContext = getContext(test.input);
      expect(results)
        .to.have.property('contextType')
        .to.be.equal(test.expected.contextType);
      expect(results)
        .to.have.property('tables')
        .deep.equal(test.expected.tables);
    });
  });
};

export const runAdapterTest = (
  config: IDbConfiguration,
  contextEvaluator: IContextEvaluator,
  input: string,
  expected?: ICompleterItem[],
) => {
  const adapter = new SqlAutocompleter(config, contextEvaluator);
  const position = input.indexOf('|');
  const query = input.replace('|', '');
  const completers = adapter.getCompleters(query, position);
  it(`it should return comleters = ${expected}`, () => {
    expect(completers).to.be.deep.equal(expected)
  });
};
