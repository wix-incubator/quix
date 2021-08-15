import { expect } from 'chai';
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
