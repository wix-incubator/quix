
import {expect} from 'chai';
import { trinoToJs } from './trinoToJs';
describe.only('testing trinoToJs function usecase:   ', () => {

  it('should translate a simple row to a js object', () => {
    const path = 'row(aa varchar)';
    expect(trinoToJs(path, 0)).to.deep.equal({ aa: 'varchar' }); //length after change of vars
  });

  it('should translate a simple nested row to a nested js object', () => {
    const path = 'row(a varchar, b row(a varchar))';
    expect(trinoToJs(path, 0)).to.deep.equal({ a: 'varchar', b: { a: 'varchar' } });
  });

  it('should translate the multilayered row to a js object', () => {
    const path = 'row(a varchar, b row(c varchar), d e, f row(g row(h row(i varchar))))';
    const expected = { a: 'varchar', b: { c: 'varchar' }, d: 'e', f: { g: { h: { i: 'varchar' } } } };
    expect(trinoToJs(path, 0)).to.deep.equal(expected);
  });

  it('should translate a row with multiple data structures', () => {
    const path = 'row(a map(a,a), b row(c varchar), d array(asdasd,asdsd,sdsd), f row(g row(h row(i array(irrelevant,info,rmation)))))';
    expect(trinoToJs(path, 0)).to.deep.equal({ a: 'map', b: { c: 'varchar' }, d: 'array', f: {g: {h: { i: 'array'}}} });
  });

  it('should return an empty input when given an empty one', () => {
    const path = '';
    expect(trinoToJs(path, 0)).to.deep.equal('');
  });

  it('should parse the nested map and return "map"', () => {
    const path = 'map(row(a varchar, b bigint), row(c double, d boolean))';
    expect(trinoToJs(path, 0)).to.deep.equal('map');
  });

  it('should parse the nested array and return "array"', () => {
    const path = 'array(row(a varchar, b map(c integer, d boolean)), row(e double, f map(g varchar, h array(integer))))';
    expect(trinoToJs(path, 0)).to.deep.equal('array');
  });

  it('should fail because of invalid data structure', () => {
    const path = 'row(a hello(a,b))';
    try {
      expect(trinoToJs(path, 0)).to.deep.equal({});
    } catch (error) {
      expect(error.message).to.equal('Error at index: hello');
    }
  });

  it('should fail because of invalid char in key', () => {
    const path = 'row(a@b row(a,b))';
    try {
      expect(trinoToJs(path, 0)).to.deep.equal({});
    } catch (error) {
      expect(error.message).to.equal('Error at index: 5, illegal key value');
    }
  });

  it('should fail because of invalid comma', () => {
    const path = 'row(a , row(a,b))';
    try {
      expect(trinoToJs(path, 0)).to.deep.equal({});
    } catch (error) {
      expect(error.message).to.equal('Error at index: ow(a , type expected before comma');
    }
  });
  
  it('should return a simple string when given one', () => {
    const path = 'a varchar';
    expect(trinoToJs(path, 0)).to.deep.equal('a varchar');
  });
  
});