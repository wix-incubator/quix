import {
  createMatchMask,
  findAllIndexOf,
} from './autocomplete-utils';
import { findRelevantPartOfPrefix } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter-utills";
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { QueryContext } from '../../../sql-autocomplete/sql-context-evaluator';


export function matchMaskAndScoreAfterDotObject(all: AceCompletion[], indexes: number[]): AceCompletion[] {
  const perfectScore = 10000;
  for (const completionItem of all) {
    completionItem.matchMask = createMatchMask(indexes, 0);
    completionItem.score = perfectScore;
  }
  return all;
}

export function matchMaskAndScoreInObjectSearch(all: AceCompletion[], queryContext: QueryContext, prefix: string): AceCompletion[] {
  const resultArr: AceCompletion[] = [];
  const perfectScore = 10000;

  for (const completionItem of all) {
    const relevantPartOfPrefix = findRelevantPartOfPrefix(queryContext.tables, prefix.split('.')).slice(0, -1);
    const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
    const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
    const searchPart = relevantPartOfPrefix.replace(startOfSearch, '');
    const indexes = findAllIndexOf(completionItem.caption, searchPart);
    
    updateCompletionItem(completionItem, indexes, searchPart, perfectScore, resultArr);
  }

  return resultArr;
}


export function matchMaskAndScoreCollumSearch(all: AceCompletion[], lowerCasedPrefix: string): AceCompletion[] {
  const resultArr: AceCompletion[] = [];
  const perfectScore = 10000;

  all.forEach(completionItem => {
    const indexes = findAllIndexOf(completionItem.value, lowerCasedPrefix);
    updateCompletionItem(completionItem, indexes, lowerCasedPrefix, perfectScore, resultArr);
  });

  return resultArr;
}


export function filterMatchMaskAndAddHighlightKeyWord(all: AceCompletion[], prefix: string): AceCompletion[] {
  const perfectScore = 10000;
  
  return all
    .filter(obj => obj.value.toLowerCase().includes(prefix.toLowerCase()))
    .map(completionItem => {
      const indexes = findAllIndexOf(completionItem.value, prefix);
      updateCompletionItem(completionItem, indexes, prefix, perfectScore, []);
      return completionItem;
    });
}

function updateCompletionItem(
  completionItem: AceCompletion,
  indexes: number[],
  searchPart: string,
  perfectScore: number,
  resultArr: AceCompletion[]
): void {
  if (indexes.length > 0) {
    completionItem.matchMask = createMatchMask(
      indexes,
      searchPart.length
    );
    completionItem.score = perfectScore - indexes[0];
    resultArr.push(completionItem);
  }
}