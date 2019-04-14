import {TokensMap} from './tokensMap';
import antlr4 from 'antlr4';
import prestoLanguage from '../../presto-grammar';
import {last, mapValues} from 'lodash';
import {CommonToken} from '../types/index';

export const createTokenizer = (input: string) => {
  const stream = new antlr4.InputStream(input);
  const lexer = new prestoLanguage.SqlBaseLexer.SqlBaseLexer(stream);
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

export interface GetIdentifersResult {
  identifiers: string[];
  strings: string[];
}

const TokenTypeToPropNameMap = new Map<TokensMap, keyof GetIdentifersResult>(
  [[TokensMap.IDENTIFIER, 'identifiers'], [TokensMap.STRING, 'strings']]);

export function getIdentifiers(tokens: CommonToken[]): GetIdentifersResult {
  const res = {identifiers: {}, strings: {}};

  tokens.forEach(token => {
    const prop = TokenTypeToPropNameMap.get(token.type);

    if (prop) {
      res[prop][token.text] = true;
    }
  });

  return mapValues(res, t => Object.keys(t)) as any;
}
