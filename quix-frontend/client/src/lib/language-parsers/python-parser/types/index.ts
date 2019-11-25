export type TokensMap = number;
export interface CommonToken {
  channel: number;
  column: number;
  line: number;
  start: number;
  stop: number;
  source: any[];
  tokenIndex: number;
  type: TokensMap;
  text: string;
}
