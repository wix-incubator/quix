import antlr4 from 'antlr4';
import {Python3Lexer} from '../../python-grammar/lang/python/Python3Lexer';
import last from 'lodash/last';
import {CommonToken} from '../types/index';

export const createTokenizer = (input: string) => {
  const stream = new antlr4.InputStream(input);
  const lexer = new Python3Lexer(stream);
  const tokenizer = new antlr4.CommonTokenStream(lexer);
  return tokenizer;
};

const generateTokens = (tokenizer: any) => {
  do {
    tokenizer.consume();
  }
  while (last<any>(tokenizer.tokens).type !== -1);

  return tokenizer.tokens as CommonToken[];
};

export function tokenize(input: string) {
  const tokenizer = createTokenizer(input);
  return generateTokens(tokenizer);
}
