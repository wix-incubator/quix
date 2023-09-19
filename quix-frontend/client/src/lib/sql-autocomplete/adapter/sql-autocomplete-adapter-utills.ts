import { findLastDotIndex } from "../../runner/services/autocomplete/highlight-and-score";
import { Column } from "../db-info";
import { TableInfo } from "../sql-context-evaluator";
import { trinoToJs } from "./trinoToJs"

interface ObjectChild {
  name: string;
  dataType: any;
}

export function getObjectChildren(obj: Record<string, any>, parentName = ''): ObjectChild[] {
  const children: ObjectChild[] = [];

  for (const key in obj) {
    const childName = parentName ? `${parentName}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      children.push({ name: childName, dataType: obj[key] });
      children.push(...getObjectChildren(obj[key], childName));
    } else {
      children.push({ name: childName, dataType: obj[key] });
    }
  }
  return children;
}

export function findColumnPathForPrefix(tables: TableInfo[], brokenPrefix: string[]): string {
  const relevantPrefixes: string[] = [];

  for (const table of tables) {
    for (const column of table.columns) {
      let found = false;
      let gotRelevantPartOfPrefix = false;
      let currentPrefix = '';

      brokenPrefix.forEach(item => {
        if (found) {
          currentPrefix += item + '.';
        }
        if (typeof column === 'object' && !gotRelevantPartOfPrefix && item === column.name) {
          found = true;
          gotRelevantPartOfPrefix = true;
          currentPrefix += item + '.';
        }
      });

      if (currentPrefix) {
        relevantPrefixes.push(currentPrefix);
      }
    }
  }

  if (relevantPrefixes.length === 0) {
    return ''; // No relevant prefixes found
  }

  // Find the longest relevant prefix
  let longestPrefix = relevantPrefixes[0];
  for (const prefix of relevantPrefixes) {
    if (prefix.length > longestPrefix.length) {
      longestPrefix = prefix;
    }
  }

  return longestPrefix
}



function getAllChildrenOfTables(tables: TableInfo[]) {
  const allChildren = [];

  for (const extractedTable of tables) {
    const { columns } = extractedTable;

    (columns.filter(c => typeof c === 'object') as Column[])
      .forEach(({ name, dataType }) => {
        if (typeof dataType === 'string') {
          dataType = trinoToJs(dataType, 0);
        }
        if (typeof dataType === 'object') {
          allChildren.push(...getObjectChildren(dataType, name));
        }
      });
  }

  return allChildren;
}




export function getSearchCompletion(tables: TableInfo[], prefix: string | undefined): any {
  if (!prefix.includes('.')) {
    return [];
  }
  const columnPathForPrefix = findColumnPathForPrefix(tables, prefix.split('.')).slice(0, -1);
  if (!columnPathForPrefix) {
    return []
  }
  const filteredChildren = getAllChildrenOfTables(tables).filter(byPrefix(columnPathForPrefix));
  const prefixUntilLastDot = extractPrefixUntilLastDot(columnPathForPrefix);
  const completionArray = filteredChildren.map(({ name, dataType }) => ({
    value: name,
    meta: typeof dataType === 'object' ? 'row' : dataType,
    caption: name.slice(prefixUntilLastDot.length + 1)
  }));
  return completionArray;
}

function byPrefix(relevantPartOfPrefix: string) {
  return ({ name }) => {
    const startOfSearch = findLastDotIndex(relevantPartOfPrefix) >= 0 ? relevantPartOfPrefix.slice(0, findLastDotIndex(relevantPartOfPrefix) + 1) : relevantPartOfPrefix;
    const searchPart = relevantPartOfPrefix.replace(startOfSearch, '')
    const parts = name.toLowerCase().split('.');

    if (parts.length <= 1) { return false }

    const substringAfterFirstDot = parts.slice(1).join('.');
    const criteria = doesSubstringMatchInHierarchy(substringAfterFirstDot, searchPart.toLowerCase());
    const filterIfInDifferentColumn = name.startsWith(relevantPartOfPrefix.split('.')[0]);

    return name.includes(startOfSearch) && substringAfterFirstDot.includes(searchPart.toLowerCase()) && criteria && filterIfInDifferentColumn;
  };
}

export function getNextLevel(tables: TableInfo[], prefix: string | undefined): any {
  const columnPathForPrefix = findColumnPathForPrefix(tables, prefix.split('.')).slice(0, -1);
  const siblings = getAllChildrenOfTables(tables).filter(({ name }) => {
    const dotCount = name.split('.').length - 1;
    return name.startsWith(columnPathForPrefix) && dotCount === columnPathForPrefix.split('.').length - 1;
  });
  return siblings.map(({ name, dataType }) => ({
    value: prefix.replace(columnPathForPrefix, '') + name,
    meta: typeof dataType === 'object' ? 'row' : dataType,
    caption: name.slice(columnPathForPrefix.length)
  }));
}

function doesSubstringMatchInHierarchy(substringAfterFirstDot, searchPart) {
  const lastDotIndex = findLastDotIndex(substringAfterFirstDot);
  return lastDotIndex >= 0 ? substringAfterFirstDot.substring(lastDotIndex + 1).includes(searchPart) : substringAfterFirstDot.includes(searchPart);
}


function extractPrefixUntilLastDot(inputString: string) {
  const lastDotIndex = findLastDotIndex(inputString);

  return lastDotIndex >= 0 ?
    inputString.substring(0, lastDotIndex) :
    inputString
}