import {expect} from 'chai';
import QuixFormatter from '../../src/lib/sql-formatter/languages/SqlWithQuixVarFormmater';
import behavesLikeSqlFormatter from './behavesLikeSqlFormatter';


describe('quix formatter', () => {
  behavesLikeSqlFormatter();
  const query1 = `select foo,bar from $CATALOG.bla.bla where aaa in (1,2,3,4,5) and date_created > date '$START_TIME';`;
  // const query2 = `/*first vertical selection*/
  // with vs as(
  // select first_vertical_date
  //        ,client_id
  //        ,category
  //        ,subcat
  // from(
  // select * ,ROW_NUMBER() OVER(PARTITION BY client_id ORDER BY first_vertical_date asc) as rows
  // from (
  // select * from(
  // select  date_created as first_vertical_date
  //        ,client_id
  //        ,category
  //        ,subcat
  // from events.dbo.anonymous_2
  // where evid=30
  // and date_created between timestamp '2015-10-11 00:00:00' and timestamp '2015-10-25 23:59:00'

  //    union all

  // select  date_created as first_vertical_date
  //        ,client_id
  //        ,category
  //        ,subcat
  // from events.dbo.users_2
  // where evid=30
  // and date_created between timestamp '2015-10-11 00:00:00' and timestamp '2015-10-25 23:59:00'
  //     )
  //    )
  // )where rows=1
  // )

  // select * from vs`;

  it('should handle quix variables correctly', () => {
    const expected = `select
  foo,
  bar
from
  $CATALOG.bla.bla
where
  aaa in (1, 2, 3, 4, 5)
  and date_created > date '$START_TIME';`;
    const formatted = new QuixFormatter().format(query1);
    expect(formatted).to.be.equal(expected);
  });

  it('should transform keywords to uppercase', () => {
    const expected = `SELECT
  foo,
  bar
FROM
  $CATALOG.bla.bla
WHERE
  aaa IN (1, 2, 3, 4, 5)
  AND date_created > date '$START_TIME';`;
    const formatted = new QuixFormatter().format(query1, {keyWordsToUpperCase: true});
    expect(formatted).to.be.equal(expected);
  });
});
