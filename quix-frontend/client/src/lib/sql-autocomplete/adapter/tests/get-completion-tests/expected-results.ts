import { makeCompletionItem } from '../../../../runner/services/autocomplete/autocomplete-utils';

export const expectedResult = {
  empty: [],
  twoColumns: [
    makeCompletionItem('col1', 'column'),
    makeCompletionItem('col2', 'column'),
  ],
  twoColumnsWithAlias: [
    makeCompletionItem('col1', 'column'),
    makeCompletionItem('tbl1.col1', 'column'),
    makeCompletionItem('col2', 'column'),
    makeCompletionItem('tbl.col2', 'column'),
  ],
  twoColumnsWithTwoAliases: [
    makeCompletionItem('col1', 'column'),
    makeCompletionItem('tbl1.col1', 'column'),
    makeCompletionItem('col2', 'column'),
    makeCompletionItem('tbl1.col2', 'column'),
    makeCompletionItem('tbl2.col1', 'column'),
    makeCompletionItem('tbl2.col2', 'column'),
  ],
};
