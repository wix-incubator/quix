import { expect } from 'chai';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';
import {  IDbInfoConfig, DbInfoService } from '../../db-info/';
import { IContextEvaluator } from '../types';

export const testDbConfig = new DbInfoService('trino', 'https://bo.wix.com/quix');

export const runAdapterTest = (
  config: IDbInfoConfig,
  contextEvaluator: IContextEvaluator,
  input: string,
  expected?: ICompleterItem[]
) => {
  const adapter = new SqlAutocompleter(config, contextEvaluator);
  const position = input.indexOf('|');
  const query = input.replace('|', '');
  const completers = adapter.getCompleters(query, position);
  it(`it should return comleters = ${expected}`, () => {
    expect(completers).to.be.deep.equal(expected);
  });
};
