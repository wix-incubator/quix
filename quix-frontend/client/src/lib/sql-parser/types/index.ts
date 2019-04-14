import {TokensMap} from '../tokenizer/tokensMap';

export interface CommonToken {
  channel: number;
  column: number;
  line: number;
  start: number;
  stop: number;
  source: any[];
  tokenIndex: number;
  type: TokensMap; //token type from SqlBase.tokens
  text: string;
}
