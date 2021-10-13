/* tslint:disable:no-bitwise */

import { IEditSession } from 'brace';
import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { reservedPrestoWords } from '../../../sql-autocomplete/languge/reserved-words';

let keywords: ICompleterItem[] = [];
let snippets: ICompleterItem[] = [];

export const getKeywordsCompletions = (): ICompleterItem[] => {
  // TODO: FIND A WAY TO FETCH KEYWORDS FROM ANTLR GRAMMAR
  keywords =
    keywords ??
    reservedPrestoWords.map((keyword) =>
      makeCompletionItem(keyword, 'keyword')
    );
  return keywords;
};

export const getSnippetsCompletions = (): ICompleterItem[] => {
  snippets =
    snippets ??
    [
      [
        'SELECT * FROM table_name WHERE column_name > 10 ORDER BY column_name',
        'Simple Query',
      ],
      ['WITH table_name AS (SELECT * FROM table_name)', 'With Query'],
    ].map(([snippet, caption]) =>
      makeCompletionItem(
        snippet,
        'snippet',
        caption !== '' ? caption : undefined
      )
    );
  return snippets;
};

/**
 * create an array of bitmaps.
 *  if ((bit j of array[i]) === 1) means that the character i*31 + j should be marked in UI
 *
 * @param {number} start
 * @param {number} length
 * @returns {number[]}
 */
export const createMatchMask = (start: number, length: number): number[] => {
  const res = [];

  for (let i = start; i < start + length; i++) {
    const index = i % 31;
    const offset = i - 31 * index;
    res[index] = res[index] || 0;
    res[index] = res[index] | (1 << offset);
  }

  return res;
};

export const makeCompletionItem = (
  value: string,
  meta: string,
  caption?: string,
  matchMask?: number[]
): ICompleterItem => {
  const completer = {
    value,
    meta,
    ...(caption ? { caption } : {}),
    ...(matchMask ? { matchMask } : {}),
  };
  return completer;
};

export const getQueryAndCursorPositionFromEditor = (
  editorInstance: CodeEditorInstance,
  session: IEditSession
) => {
  let query: string = session
    .getDocument()
    .getAllLines()
    .join('\n');
  let position: number = session
    .getDocument()
    .positionToIndex(session.selection.getCursor(), 0);

  if (editorInstance.getParams().hasParams()) {
    const tempQuery =
      query.slice(0, position) + '@REPLACE_ME@' + query.slice(position);
    query = editorInstance.getParams().format(tempQuery);
    position = query.indexOf('@REPLACE_ME@');
    query = query.replace('@REPLACE_ME@', '');
  }

  return { query, position };
};
