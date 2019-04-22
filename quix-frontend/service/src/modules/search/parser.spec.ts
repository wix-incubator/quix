import {parse} from './parser';
import {SearchQuery} from './types';

describe('search query parser', () => {
  describe('basic', () => {
    it('handle basic text search', () => {
      const input = 'select 1 from foo';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle weird charchters', () => {
      const input = 'select $START_TIME from foo';
      const expected: SearchQuery = {
        content: ['select', '$START_TIME', 'from', 'foo'],
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle expression wrapped in quotes', () => {
      const input = '"select bar from" foo';
      const expected: SearchQuery = {
        content: ['select bar from', 'foo'],
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle multiple spaces', () => {
      const input = 'select\t1    from\nfoo';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
      };
      expect(parse(input)).toEqual(expected);
    });
  });

  describe('with special operators', () => {
    it('handle user operator', () => {
      const input = 'user:foo@wix.com select 1 from foo';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
        owner: 'foo@wix.com',
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle user operator wihtout any string', () => {
      const input = 'user:foo@wix.com';
      const expected: SearchQuery = {
        content: [],
        owner: 'foo@wix.com',
      };
      expect(parse(input)).toEqual(expected);
    });

    it('do not handle user operator in the middle of a sentance', () => {
      const input = 'select bar user:foo@wix.com from foo';
      const expected: SearchQuery = {
        content: ['select', 'bar', 'user:foo@wix.com', 'from', 'foo'],
      };
      expect(parse(input)).toEqual(expected);
    });

    it('do not handle user operator in the middle of a sentance', () => {
      const input = 'select bar from foo user:foo@wix.com';
      const expected: SearchQuery = {
        content: ['select', 'bar', 'from', 'foo'],
        owner: 'foo@wix.com',
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle name operator', () => {
      const input = 'name:anewnotebook select 1 from foo';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
        name: 'anewnotebook',
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle name operator with spaces', () => {
      const input = 'name:"a new notebook" select 1 from foo';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
        name: 'a new notebook',
      };
      expect(parse(input)).toEqual(expected);
    });

    it('handle type operator', () => {
      const input = 'type:python select 1 from foo';
      const input2 = 'select 1 from foo type:python';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
        type: 'python',
      };
      expect(parse(input)).toEqual(expected);
      expect(parse(input2)).toEqual(expected);
    });

    it('multuple operators', () => {
      const input =
        'type:python name:"a new notebook" select 1 from foo user:foo@wix.com';
      const expected: SearchQuery = {
        content: ['select', '1', 'from', 'foo'],
        type: 'python',
        name: 'a new notebook',
        owner: 'foo@wix.com',
      };
      expect(parse(input)).toEqual(expected);
    });
  });
});
