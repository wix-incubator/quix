import {
  createMatchMask,
  findAllIndexOf,
} from './autocomplete-utils';
import { findRelevantPartOfPrefix } from "../../../sql-autocomplete/adapter/sql-autocpmplete-adapter-utills";
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { QueryContext } from '../../../sql-autocomplete/sql-context-evaluator';


export function addHighlightAndScoreAfterDotObject(all: AceCompletion[], indexes: number[], lowerCasedPrefix: string): AceCompletion[] {
  const perfectScore = 10000;
  for (const completionItem of all) {
    completionItem.matchMask = createMatchMask(indexes, 0);
    completionItem.score = perfectScore - 0;
  }  
  return all;
}

export function addHighlightAndScoreInObjectSearch(all: AceCompletion[], queryContext: QueryContext, prefix: string): AceCompletion[] {
  const resultArr: AceCompletion[] = [];
for (const completionItem of all) {
    const relevantPartOfPrefix = findRelevantPartOfPrefix(queryContext.tables, prefix.split('.')).slice(0, -1);
    const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
    const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
    const searchPart = relevantPartOfPrefix.replace(startOfSearch, '');
    const indexes = findAllIndexOf(completionItem.caption, searchPart);
    if (indexes.length > 0) {
        completionItem.matchMask = createMatchMask(
            indexes,
            searchPart.length
        );
        completionItem.score = 10000 - indexes[0];
        resultArr.push(completionItem);
    }
}

return resultArr;
}

export function addHighlightAndScoreCollumSearch(all: AceCompletion[], lowerCasedPrefix: string): AceCompletion[] {
  all.reduce((resultArr: AceCompletion[], completionItem) => {
    const indexes = findAllIndexOf(completionItem.value, lowerCasedPrefix);

    if (indexes.length > 0) {
      completionItem.matchMask = createMatchMask(
        indexes,
        lowerCasedPrefix.length
      );
      completionItem.score = 10000 - indexes[0];
      resultArr.push(completionItem);
    }

    return resultArr;
  }, []);
  return all;
}

export function filterAndAddHighlightAndForKeyWord(all: AceCompletion[], prefix: string): any[] {
  const filteredArray = all.filter(obj => obj.value.toLowerCase().includes(prefix.toLowerCase()));
  filteredArray.reduce((resultArr: AceCompletion[], completionItem) => {
    const indexes = findAllIndexOf(completionItem.value, prefix);

    if (indexes.length > 0) {
      completionItem.matchMask = createMatchMask(
        indexes,
        prefix.length
      );
      completionItem.score = 10000 - indexes[0];
      resultArr.push(completionItem);
    }

    return resultArr;
  }, []);
  return filteredArray;
}
