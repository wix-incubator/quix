/* tslint:disable:no-bitwise */

import { IEditSession } from 'brace';
import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { reservedPrestoWords } from '../../../sql-autocomplete/languge/reserved-words';
import { ContextType } from '../../../sql-autocomplete/sql-context-evaluator/types';

let keywords: ICompleterItem[];

export const getKeywordsCompletions = (): ICompleterItem[] => {
  // TODO: FIND A WAY TO FETCH KEYWORDS FROM ANTLR GRAMMAR
  keywords =
    keywords ??
    reservedPrestoWords.map((keyword) =>
      makeCompletionItem(keyword, 'keyword')
    );
  return keywords;
};

/**
 * create an array of bitmaps.
 *  if ((bit j of array[i]) === 1) means that the character i*31 + j should be marked in UI
 *
 * @param {number | number[]} start
 * @param {number} length
 * @returns {number[]}
 */
export const createMatchMask = (
  start: number | number[],
  length: number
): number[] => {
  const res = [];

  start = Array.isArray(start) ? start : [start];
  start.forEach((startElement) => {
    for (let i = startElement; i < startElement + length; i++) {
      const index = i % 31;
      const offset = i - 31 * index;
      res[index] = res[index] || 0;
      res[index] = res[index] | (1 << offset);
    }
  });

  return res;
};

export async function getSuggestions(queryContext, keywordsCompletions, sqlAutocompleter, searchInObject) {
  if (queryContext.contextType === ContextType.Undefined) {
    return keywordsCompletions.filter(obj => obj.value.toLowerCase().includes(queryContext.prefix.toLowerCase()));
  }

  return searchInObject
    ? sqlAutocompleter.getCompletionItemsFromQueryContextColumn(
      queryContext
    )
    : sqlAutocompleter.getCompletionItemsFromQueryContext(
      queryContext
    );

}

export async function isSearchInObject(queryContext, sqlAutocompleter) {
  if (queryContext.contextType === ContextType.Column && queryContext.prefix) {
    const completions = await sqlAutocompleter.getCompletionItemsFromQueryContext(
      queryContext
    )
    const filteredCompletions: object[] = completions.filter(obj => obj.value.toLowerCase().includes(queryContext.prefix));
    return filteredCompletions.length === 0;
  }
  return false
}


export function createCaption(str: string) {
  const maxCaptionLength = 60;
  const maxSubCaptionLength = 57;

  if (str.length > maxCaptionLength) {
    return str.substring(0, maxSubCaptionLength) + "...";
  }

  return str;
}

export const makeCompletionItem = (
  value: string,
  meta: string,
  caption?: string,
  matchMask?: number[],
  score?: number
): ICompleterItem => {
  const completer = {
    value,
    meta,
    ...(caption ? { caption } : {}),
    ...(matchMask ? { matchMask } : {}),
    ...(score ? { score } : {}),
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

export const findAllIndexOf = (haystack: string, needle: string) => {
  const indexes: number[] = [];
  if (needle === '') {
    return indexes;
  }
  haystack = haystack.toLowerCase();
  needle = needle.toLowerCase();

  let index = 0;
  while (index !== -1) {
    index = haystack.indexOf(needle, index);
    if (index !== -1) {
      indexes.push(index);
      index++;
    }
  }

  return indexes;
};
