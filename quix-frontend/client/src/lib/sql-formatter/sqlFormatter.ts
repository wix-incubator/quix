import StandardSqlFormatter from './languages/StandardSqlFormatter';
import QuixSqlFormatter from './languages/SqlWithQuixVarFormmater';
export interface Cfg {
  language?: 'sql' | 'quixsql';
  params?: Record<string, string> | string[];
  indent?: string;
  upperCase?: boolean;
}
export default {
  /**
   * Format whitespaces in a query to make it easier to read.
   *
   * @param {String} query
   * @param {Object} cfg
   *  @param {String} cfg.language Query language, default is Standard SQL
   *  @param {String} cfg.indent Characters used for indentation, default is "  " (2 spaces)
   *  @param {Object} cfg.params Collection of params for placeholder replacement
   * @return {String}
   */
  format: (query, cfg: Cfg = {}) => {
    switch (cfg.language) {
      case 'sql':
      case undefined:
        return new StandardSqlFormatter(cfg).format(query);
      case 'quixsql':
        return new QuixSqlFormatter(cfg).format(query);
      default:
        throw Error(`Unsupported SQL dialect: ${cfg.language}`);
    }
  },
};
