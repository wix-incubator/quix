import { runAdapterTest } from './tests-utils';
import { results } from './expected-results';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';
import { DbInfoService, IDbInfoConfig } from '../../db-info';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { expect } from 'chai';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';

describe.only('when reciving presto query', () => {
  
  describe('with simple query', () => {
    describe('And cursor after select', () => {
      runAdapterTest(
        'select | from from prod.adi.adi_bots_black_list',
        results.adi_bots_black_list_with_name
      );
      runAdapterTest(
        'select | from prod.adi.adi_bots_black_list as tbl1',
        results.adi_bots_black_list_with_alias
      );
      runAdapterTest(
        'select | from from prod.adi.adi_bots_black_list as tbl1, prod.adi.adi_bots_black_list as tbl2',
        results.double_adi_bots_black_list_with_aliases
      );
    });
  });

  describe('with nested query', () => {
    describe('And cursor after select', () => {
      runAdapterTest(
        'select | from (select date_updated, reason, uuid from prod.adi.adi_bots_black_list)',
        results.adi_bots_black_list
      );
      runAdapterTest(
        'select | from (select * from prod.adi.adi_bots_black_list)',
        results.adi_bots_black_list
      );
      runAdapterTest(
        'select | from (select * from prod.adi.adi_bots_black_list) as tbl1',
        results.adi_bots_black_list_with_alias
      );
      runAdapterTest(
        'select | from (select * from prod.adi.adi_bots_black_list) as tbl1',
        results.adi_bots_black_list_with_alias
      );
    });
  });

  describe('with withTable', () => {
    describe('And cursor after select', () => {
      runAdapterTest(
        'with tbl1 as (select * from prod.adi.adi_bots_black_list) select | from tbl1',
        results.adi_bots_black_list_with_alias
      );
      runAdapterTest(
        'with tbl1 as (select date_updated, reason, uuid from prod.adi.adi_bots_black_list) select | from tbl1',
        results.adi_bots_black_list_with_alias
      );
      runAdapterTest(
        'with tbl1 as (select * from prod.adi.adi_bots_black_list), tbl2 as (select uuid from tbl3) select | from tbl1, tbl2',
        results.result2
      );
      runAdapterTest(
        'with tbl1 as (select * from prod.adi.adi_bots_black_list), tbl2 as (select * from prod.adidas.by_creation_tri_run_date) select | from tbl1, tbl2',
        results.result3
      );

      runAdapterTest(
        'with tbl1 as (select * from prod.adi.adi_bots_black_list) select | from tbl1, (select * from prod.adidas.by_creation_tri_run_date) as tbl2',
        results.result3
      );
      runAdapterTest(
        'with tbl1 as (select * from prod.adi.adi_bots_black_list) select | from tbl1, (select * from prod.adidas.by_creation_tri_run_date)',
        results.result4
      );
    });
  });
});
