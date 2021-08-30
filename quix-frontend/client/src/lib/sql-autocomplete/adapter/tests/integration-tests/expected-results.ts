import { makeCompletionItem } from '../../../../runner/services/autocomplete/autocomplete-utils';

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

  adi_bots_black_list_with_name: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('prod.adi.adi_bots_black_list.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('prod.adi.adi_bots_black_list.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('prod.adi.adi_bots_black_list.uuid', 'column'),
  ],

  adi_bots_black_list_with_alias: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('tbl1.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('tbl1.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('tbl1.uuid', 'column'),
  ],

  double_adi_bots_black_list_with_aliases: [
    makeCompletionItem('date_updated', 'column'),
    makeCompletionItem('tbl1.date_updated', 'column'),
    makeCompletionItem('reason', 'column'),
    makeCompletionItem('tbl1.reason', 'column'),
    makeCompletionItem('uuid', 'column'),
    makeCompletionItem('tbl1.uuid', 'column'),
    makeCompletionItem('tbl2.date_updated', 'column'),
    makeCompletionItem('tbl2.reason', 'column'),
    makeCompletionItem('tbl2.uuid', 'column'),
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
