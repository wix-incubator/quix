import {
  createMatchMask,
  findAllIndexOf,
} from './autocomplete-utils';
import { findRelevantPartOfPrefix } from "../../../sql-autocomplete/adapter/sql-autocpmplete-adapter-utills";
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';


export function AddHighlightAndScoreAfterDotObject(all: AceCompletion[], indexes: number[], lowerCasedPrefix: string): AceCompletion[] {
  all = all.reduce((resultArr: AceCompletion[], completionItem) => {
    completionItem.matchMask = createMatchMask(
      indexes,
      0
    );
    completionItem.score = 10000 - 0;
    resultArr.push(completionItem);
    return resultArr;
  }, []);
  return all;
}

export function AddHighlightAndScoreInObjectSearch(all: AceCompletion[], queryContext: any, prefix: string): AceCompletion[] {
  all.reduce((resultArr: AceCompletion[], completionItem) => {
    const relevantPartOfPrefix = findRelevantPartOfPrefix(queryContext.tables, prefix.split('.')).slice(0, -1); //if same problem for both change in function itself
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
    return resultArr;
  }, []);
  return all;
}

export function AddHighlightAndScoreCollumSearch(all: AceCompletion[], lowerCasedPrefix: string): AceCompletion[] {
  console.log("in!!")
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
