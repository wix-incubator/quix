declare module 'antlr4';
declare module 'tiny-worker' {
  export = Worker;
}

declare module 'sql-formatter/lib/languages/StandardSqlFormatter.js' {
  export interface SqlFormatterCfg {
    indent?: number;
    params?: Record<string, string>
  }
  export default class StandardSqlFormatter {
    constructor(cfg?: SqlFormatterCfg);
    format(query: string): string;
  }
}
