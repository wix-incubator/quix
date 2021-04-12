import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import {tokenizerConf} from './StandardSqlFormatter';

const reservedWords = [
  'ALTER',
  'AND',
  'AS',
  'BETWEEN',
  'BY',
  'CASE',
  'CAST',
  'CONSTRAINT',
  'CREATE',
  'CROSS',
  'CUBE',
  'CURRENT_DATE',
  'CURRENT_PATH',
  'CURRENT_ROLE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURRENT_USER',
  'DEALLOCATE',
  'DELETE',
  'DESCRIBE',
  'DISTINCT',
  'DROP',
  'ELSE',
  'END',
  'ESCAPE',
  'EXCEPT',
  'EXECUTE',
  'EXISTS',
  'EXTRACT',
  'FALSE',
  'FOR',
  'FROM',
  'FULL',
  'GROUP',
  'GROUPING',
  'HAVING',
  'IN',
  'INNER',
  'INSERT',
  'INTERSECT',
  'INTO',
  'IS',
  'JOIN',
  'LEFT',
  'LIKE',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'NATURAL',
  'NORMALIZE',
  'NOT',
  'NULL',
  'ON',
  'OR',
  'ORDER',
  'OUTER',
  'PREPARE',
  'RECURSIVE',
  'RIGHT',
  'ROLLUP',
  'SELECT',
  'TABLE',
  'THEN',
  'TRUE',
  'UESCAPE',
  'UNION',
  'UNNEST',
  'USING',
  'VALUES',
  'WHEN',
  'WHERE',
  'WITH',
];

const reservedToplevelWords = [
  'ALTER COLUMN',
  'ALTER TABLE',
  'DELETE FROM',
  'EXCEPT',
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT INTO',
  'INSERT',
  'INTERSECT',
  'LIMIT',
  'ORDER BY',
  'SELECT',
  'SET CURRENT SCHEMA',
  'SET SCHEMA',
  'SET',
  'UNION ALL',
  'UNION',
  'UPDATE',
  'VALUES',
  'WHERE',
];

const reservedNewlineWords = [
  'AND',
  'CROSS APPLY',
  'CROSS JOIN',
  'ELSE',
  'INNER JOIN',
  'JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'OR',
  'OUTER APPLY',
  'OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
  'WHEN',
  'XOR',
];

const newTokenizerConf = {
  ...tokenizerConf,
  namedPlaceholderTypes: tokenizerConf.namedPlaceholderTypes.concat(['$']),
  reservedNewlineWords,
  reservedToplevelWords,
  reservedWords,
};

export default class QuixSqlFormatter {
  private readonly cfg: any;
  private tokenizer: any;
  /**
   * @param {Object} cfg Different set of configurations
   */
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  /**
   * Format the whitespace in a Standard SQL string to make it easier to read
   *
   * @param {String} query The Standard SQL string
   * @return {String} formatted string
   */
  format(query) {
    if (!this.tokenizer) {
      this.tokenizer = new Tokenizer({...newTokenizerConf, upperCase: this.cfg.upperCase});
    }
    return new Formatter(this.cfg, this.tokenizer).format(query);
  }
}
