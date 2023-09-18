import {
  createCaption,
  createMatchMask,
  findAllIndexOf,
} from './autocomplete-utils';
import { findColumnPathForPrefix } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter-utills";
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { QueryContext } from '../../../sql-autocomplete/sql-context-evaluator';

const PERFECT_SCORE = 10000;

export function highlightAndScore(
  autocompletionSuggestions,
  queryContext,
  searchInObject
) {
  const lowerCasedPrefix = queryContext.prefix.trim().toLowerCase();
  return searchInObject
    ? enrichCompletionForObject(queryContext.prefix, autocompletionSuggestions, queryContext, lowerCasedPrefix)
    : enrichCompletionItem(autocompletionSuggestions, lowerCasedPrefix);
}

function enrichCompletionItemAfterDotObject(all: AceCompletion[]): AceCompletion[] {
  const indexes = [0];
  return all.map(completionItem => ({
    ...completionItem,
    matchMask: createMatchMask(indexes, 0),
    score: PERFECT_SCORE,
  }));
}

function enrichCompletionForObject(prefix: string, autocompletionSuggestions: any, queryContext: QueryContext, lowerCasedPrefix: string) {
  return prefix.endsWith('.')
    ? enrichCompletionItemAfterDotObject(autocompletionSuggestions)
    : enrichCompletionItemInObjectSearch(autocompletionSuggestions, queryContext, lowerCasedPrefix);
}

function enrichCompletionItemInObjectSearch(all: AceCompletion[], queryContext: QueryContext, prefix: string): AceCompletion[] {
  return all.reduce((resultArr, completionItem) => {
    const columnPathForPrefix = findColumnPathForPrefix(queryContext.tables, prefix.split('.')).slice(0, -1);
    const lastDotIndex = findLastDotIndex(columnPathForPrefix);
    const startOfSearch = lastDotIndex >= 0 ? columnPathForPrefix.slice(0, lastDotIndex + 1) : columnPathForPrefix;
    const searchPart = columnPathForPrefix.replace(startOfSearch, '');
    const indexes = findAllIndexOf(completionItem.caption, searchPart);

    updateCompletionItem(completionItem, indexes, searchPart, resultArr);

    return resultArr;
  }, []);
}


function enrichCompletionItem(all: AceCompletion[], lowerCasedPrefix: string): AceCompletion[] {
  return all.reduce((resultArr, completionItem) => {
    const indexes = findAllIndexOf(completionItem.value, lowerCasedPrefix);
    updateCompletionItem(completionItem, indexes, lowerCasedPrefix, resultArr);
    return resultArr;
  }, []);
}

function updateCompletionItem(
  completionItem: AceCompletion,
  indexes: number[],
  searchPart: string,
  resultArr: AceCompletion[]
): void {
  if (indexes.length > 0) {
    completionItem.matchMask = createMatchMask(
      indexes,
      searchPart.length
    );
    completionItem.score = PERFECT_SCORE - indexes[0];
    resultArr.push(completionItem);
  }
  completionItem.caption = createCaption(completionItem.caption || completionItem.value);
}

export function findLastDotIndex(prefix: string): number {
  return prefix.lastIndexOf('.');
}