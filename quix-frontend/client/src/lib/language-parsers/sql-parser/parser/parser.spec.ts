import {expect} from 'chai';
import {parsePrestoSql, getErrorsPrestoSql} from './';

describe('presto sql basic parser', () => {
  const defaultTestCase = `select foo,bar from table111 where foo = 'value'`;

  it('should get table name', () => {
    const results = parsePrestoSql(defaultTestCase);
    expect(results.tables).to.deep.equal(['table111']);
  });

  it('should get *qualified* table name', () => {
    const testCase = `select foo,bar from catalog1.table1 where foo = 'value'`;
    const results = parsePrestoSql(testCase);
    expect(results.tables).to.deep.equal(['catalog1.table1']);
  });

  it('should get column name', () => {
    const results = parsePrestoSql(defaultTestCase);
    expect(results.columns).to.deep.equal(['foo', 'bar']);
  });

  it('should get column name, column is qualified name', () => {
    const results = parsePrestoSql('select foo.bar from sometable where base.col > 4');
    expect(results.columns).to.deep.equal(['foo.bar', 'base.col']);
  });

  it('should have no duplicates', () => {
    const testcase = `select foo,bar from table111 where foo = 'value' and bar = 'value'`;
    const results = parsePrestoSql(testcase);
    expect(results.strings).to.deep.equal([`'value'`]);
  });

  it('should get subqueries', () => {
    const testcase = `WITH x AS (SELECT a, MAX(b) AS b FROM t GROUP BY a) SELECT a, b FROM x`;
    const results = parsePrestoSql(testcase);

    expect(results.subQueries).to.deep.equal(['x']);
    expect(results.tables).to.deep.equal(['t']);
  });

  it('should get subqueries, sql not valid', () => {
    const testcase = `WITH x AS (SELECT a`;
    const results = parsePrestoSql(testcase);
    expect(results.subQueries).to.deep.equal(['x']);
    expect(results.columns).to.deep.equal(['a']);
  });

  it('should parse multiple queries', () => {
    const testcase = `select foo from bar; select aa from bb;`;
    const results = parsePrestoSql(testcase);
    expect(results.tables).to.deep.equal(['bar', 'bb']);
  });

  it('should parse alias table', () => {
    const testcase = `select foo from bar as b; select aa from aaa as a;`;
    const results = parsePrestoSql(testcase);
    expect(results.tableAlias).to.deep.equal(['b', 'a']);
  });

  describe('string constants', () => {
    it('should get string constants', () => {
      const results = parsePrestoSql(defaultTestCase);
      expect(results.strings).to.deep.equal([`'value'`]);
    });

    it('should get string constants 2', () => {
      const testcase = `select
      evid evid_open
      ,esi esi_open
      , uuid uuid_open
      , date_created date_open
      from users_38
      where
      ((evid = 429))
      and
      date_created between date '2017-03-01' and  current_date`;
      const results = parsePrestoSql(testcase);
      expect(results.strings).to.deep.equal([`'2017-03-01'`]);
    });
  });
});

describe('error annotation', () => {
  const testcase = `
  select * from where a > 4
  `;

  it('should get errors', () => {
    const errors = getErrorsPrestoSql(testcase);
    expect(errors.length).to.be.at.least(1);
    expect(errors[0].row).to.be.eq(1);
    expect(errors[0].text).to.contain('extraneous input \'where\' expecting');
  });

  it('should get errors, query with new lines', () => {
    const errors = getErrorsPrestoSql(`select *


    from b where a > 4;

    select foo

    from where a > 5;
`);
    expect(errors.length).to.be.at.least(1);
    expect(errors[0].row).to.be.eq(7);
    expect(errors[0].text).to.contain('extraneous input \'where\' expecting');
  });
});
