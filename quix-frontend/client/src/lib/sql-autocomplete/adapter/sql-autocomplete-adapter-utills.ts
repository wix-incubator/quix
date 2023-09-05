import { findLastDotIndex } from "../../runner/services/autocomplete/highlight-and-score";
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

  return children.map(child => {
    child.name = child.name.replace(/\.dataType$/, '');
    return child;
  });
}

export function findRelevantPartOfPrefix(tables: TableInfo[], brokenPrefix: string[]): string {
  // Remove empty cells from brokenPrefix array
  brokenPrefix = brokenPrefix.filter(cell => cell.trim() !== '');

  const relevantPrefixes: string[] = [];

  for (const table of tables) {
    for (const column of table.columns) {
      let found = false;
      let gotRelevantPartOfPrefix = false;
      let currentPrefix = '';

      brokenPrefix.forEach(cell => {
        if (found) {
          currentPrefix += cell + '.';
        }
        if (typeof column === 'object' && !gotRelevantPartOfPrefix && cell === column.name) {
          found = true;
          gotRelevantPartOfPrefix = true;
          currentPrefix += cell + '.';
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

    for (const column of columns) {
      if (typeof column === 'object') {
        if (typeof column.dataType === 'string') {
          column.dataType = trinoToJs(column.dataType, 0);
        } else if (typeof column.dataType === 'object') {
          allChildren.push(...getObjectChildren(column.dataType, column.name));
        }
      }
    }
  }

  return allChildren;
}


export function getSearchCompletion(tables: TableInfo[] , prefix: string | undefined):any {
  if(!prefix.includes('.')) {
    return [];
  }
  const allChildren = getAllChildrenOfTables(tables);
  const relevantPartOfPrefix = findRelevantPartOfPrefix(tables , prefix.split('.')).slice(0, -1);
  if( !relevantPartOfPrefix )  {
    return []
  }
  const lastDotIndex = findLastDotIndex(relevantPartOfPrefix);
  const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
  const searchPart = relevantPartOfPrefix.replace(startOfSearch,'')
  const filteredChildren = allChildren.filter(obj => {
  const lowerCasedName = obj.name.toLowerCase();
  const parts = lowerCasedName.split('.');
    if (parts.length > 1) {
        const substringAfterFirstDot = parts.slice(1).join('.');
        const criteria = checkCriteria(substringAfterFirstDot , searchPart.toLowerCase());
        const filterIfInDifferentColumn = obj.name.startsWith(relevantPartOfPrefix.split('.')[0]);
        return obj.name.includes(startOfSearch) && substringAfterFirstDot.includes(searchPart.toLowerCase()) && criteria && filterIfInDifferentColumn ;
    }
    return false;
});
const prefixUntilLastDot = extractPrefixUntilLastDot(relevantPartOfPrefix) ;
  const completionArray = filteredChildren.map(obj => ({
    value: obj.name,
    meta : typeof obj.dataType === 'object' ? 'row' : obj.dataType,
    caption:  obj.name.slice( prefixUntilLastDot.length +1)
  }));
  return completionArray;
}

export function getNextLevel(tables: TableInfo[] , prefix: string | undefined): any {
  const allChildren = getAllChildrenOfTables(tables);
  const relevantPartOfPrefix = findRelevantPartOfPrefix(tables , prefix.split('.'));
  const relevantChildren = allChildren.filter(obj => {
  const dotCount = obj.name.split('.').length - 1;
    return obj.name.startsWith(relevantPartOfPrefix) && dotCount === relevantPartOfPrefix.split('.').length - 1;
  });
  const completionArray = relevantChildren.map(obj => ({
    value: prefix.replace(relevantPartOfPrefix, '') + obj.name,
    meta : typeof obj.dataType === 'object' ? 'row' : obj.dataType,
    caption:  obj.name.slice(relevantPartOfPrefix.length)
  }));
  return completionArray
}

function checkCriteria(substringAfterFirstDot, searchPart) {
  const lastDotIndex = findLastDotIndex(substringAfterFirstDot);
  
  if (lastDotIndex !== -1) {
      const partAfterLastDot = substringAfterFirstDot.substring(lastDotIndex + 1);
      if (partAfterLastDot.includes(searchPart)) {
          return true;
      }
  } else if (substringAfterFirstDot.includes(searchPart)) {
      return true;
  }
  
  return false;
}

function extractPrefixUntilLastDot(inputString) {
  const lastDotIndex = findLastDotIndex(inputString);
  
  if (lastDotIndex !== -1) {
      const prefix = inputString.substring(0, lastDotIndex);
      return prefix;
  }
  
  return inputString;
}