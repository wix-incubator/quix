export interface ContextNode {
  children: (ContextNode | Terminal)[];
  exception: any;
  invokingState: number;
  parentCtx: ContextNode;
  parser: any;
  ruleIndex: number;
  start: CommonToken;
  stop: CommonToken;
}

export interface Terminal {
  invokingState: number;
  parentCtx: ContextNode;
  symbol: CommonToken;
}

export interface CommonToken {
  channel: number;
  column: number;
  line: number;
  start: number;
  stop: number;
  source: any[];
  tokenIndex: number;
  type: number; //token type from SqlBase.tokens
  text: string;
}
