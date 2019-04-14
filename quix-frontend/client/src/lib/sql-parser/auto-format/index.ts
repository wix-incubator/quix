import SqlFormatter from 'sql-formatter/lib/languages/StandardSqlFormatter.js';

export const formatSql = (query: string) => new SqlFormatter().format(query);
