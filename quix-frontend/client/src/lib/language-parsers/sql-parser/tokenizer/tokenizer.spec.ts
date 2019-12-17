import {expect} from 'chai';
import {tokenize, getIdentifiers} from './';

describe('presto sql tokenizer', () => {
  const testCase1 = `select foo,bar from table111 where bla = 'value'`;
  const testCase2 = `select foo,bar from table111 where foo = 'value'`;

  it('should return identifiers and strings', () => {
    const tokens = tokenize(testCase1);
    const identifersAndStrings = getIdentifiers(tokens);
    expect(identifersAndStrings.identifiers).to.eql(['foo', 'bar', 'table111', 'bla']);
    expect(identifersAndStrings.strings).to.eql([`'value'`]);
  });

  it('should return a list without duplicates', () => {
    const tokens = tokenize(testCase2);
    const identifersAndStrings = getIdentifiers(tokens);
    expect(identifersAndStrings.identifiers).to.eql(['foo', 'bar', 'table111']);
  });
});
