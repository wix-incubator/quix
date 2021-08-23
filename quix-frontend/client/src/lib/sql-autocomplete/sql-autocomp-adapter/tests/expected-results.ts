import { makeCompletionItem } from '../../../runner/services/autocomplete/autocomplete-utils';

export const results = {
  result1: [
    makeCompletionItem('col1', 'column'),
    makeCompletionItem('col2', 'column'),
    makeCompletionItem('col3', 'column'),
  ],

  adi_bots_black_list: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('uuid', 'column'),
  ],
};
