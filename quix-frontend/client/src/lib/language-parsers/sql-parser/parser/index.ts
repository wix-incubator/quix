import antlr4 from 'antlr4';
import prestoLanguage from '../../presto-grammar';
import {createTokenizer} from '../tokenizer/index';
import {PrestoListener} from './presto-listener';
import {PrestoErrorListener} from './errors-listener';

export const createParser = (input: string): any => {
  const tokens = createTokenizer(input);
  return new prestoLanguage.SqlBaseParser.SqlBaseParser(tokens);
};

export const parsePrestoSql = (input: string) => {
  const parser = createParser(input);
  const prestoListener = new PrestoListener();
  parser.removeErrorListeners();
  const tree = parser.multiStatement();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(prestoListener, tree);
  return prestoListener.parseResults();
};

export const getErrorsPrestoSql = (input: string) => {
  const parser = createParser(input);
  const listener = new PrestoErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(listener);
  parser.multiStatement();
  return listener.getErrors();
};
