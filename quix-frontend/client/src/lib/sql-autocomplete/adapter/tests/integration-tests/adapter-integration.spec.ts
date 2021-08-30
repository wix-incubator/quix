import { runAdapterIntegrationTest } from '../test-utils/tests-utils';
import { results } from './expected-results';

describe('when reciving presto query', () => {
  
  // describe('with simple query', () => {
  //   describe('And cursor after select', () => {
  //     runAdapterIntegrationTest(
  //       'select | from prod.adi.adi_bots_black_list',
  //       results.adi_bots_black_list_with_name
  //     );
  //     runAdapterIntegrationTest(
  //       'select | from prod.adi.adi_bots_black_list as tbl1',
  //       results.adi_bots_black_list_with_alias
  //     );
  //     runAdapterIntegrationTest(
  //       'select | from prod.adi.adi_bots_black_list as tbl1, prod.adi.adi_bots_black_list as tbl2',
  //       results.double_adi_bots_black_list_with_aliases
  //     );
  //   });
  // });

  describe('with nested query', () => {
    describe('And cursor after select', () => {
      runAdapterIntegrationTest(
        'select | from (select date_updated, reason, uuid from prod.adi.adi_bots_black_list)',
        results.adi_bots_black_list
      );
      // runAdapterIntegrationTest(
      //   'select | from (select * from prod.adi.adi_bots_black_list)',
      //   results.adi_bots_black_list
      // );
      // runAdapterIntegrationTest(
      //   'select | from (select * from prod.adi.adi_bots_black_list) as tbl1',
      //   results.adi_bots_black_list_with_alias
      // );
      // runAdapterIntegrationTest(
      //   'select | from (select * from prod.adi.adi_bots_black_list) as tbl1',
      //   results.adi_bots_black_list_with_alias
      // );
    });
  });

  describe('with withTable', () => {
    describe('And cursor after select', () => {
      // runAdapterIntegrationTest(
      //   'with tbl1 as (select * from prod.adi.adi_bots_black_list) select | from tbl1',
      //   results.adi_bots_black_list_with_alias
      // );
      runAdapterIntegrationTest(
        'with tbl1 as (select date_updated, reason, uuid from prod.adi.adi_bots_black_list) select | from tbl1',
        results.adi_bots_black_list_with_alias
      );
      // runAdapterIntegrationTest(
      //   'with tbl1 as (select * from prod.adi.adi_bots_black_list), tbl2 as (select uuid from tbl3) select | from tbl1, tbl2',
      //   results.result2
      // );
      // runAdapterIntegrationTest(
      //   'with tbl1 as (select * from prod.adi.adi_bots_black_list), tbl2 as (select * from prod.adidas.by_creation_tri_run_date) select | from tbl1, tbl2',
      //   results.result3
      // );

      // runAdapterIntegrationTest(
      //   'with tbl1 as (select * from prod.adi.adi_bots_black_list) select | from tbl1, (select * from prod.adidas.by_creation_tri_run_date) as tbl2',
      //   results.result3
      // );
      // runAdapterIntegrationTest(
      //   'with tbl1 as (select * from prod.adi.adi_bots_black_list) select | from tbl1, (select * from prod.adidas.by_creation_tri_run_date)',
      //   results.result4
      // );
    });
  });
});
