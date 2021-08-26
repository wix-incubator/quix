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

  adi_bots_black_list_with_alias: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('tbl1.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('tbl1.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('tbl1.uuid', 'column'),
  ],
  result2: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('tbl1.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('tbl1.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('tbl1.uuid', 'column'),
    makeCompletionItem('tbl2.uuid', 'column'),
  ],

  result3: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('tbl1.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('tbl1.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('tbl1.uuid', 'column'),
    makeCompletionItem('daysback', 'column'),
    makeCompletionItem('tbl2.daysback', 'column'),
    makeCompletionItem('tri_run_date', 'column'),
    makeCompletionItem('tbl2.tri_run_date', 'column'),
  ],
  result4: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('tbl1.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('tbl1.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('tbl1.uuid', 'column'),
    makeCompletionItem('daysback', 'column'),
    makeCompletionItem('tri_run_date', 'column'),

  ],

};
