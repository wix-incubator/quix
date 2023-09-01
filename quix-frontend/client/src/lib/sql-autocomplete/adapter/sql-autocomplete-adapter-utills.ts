import { TableInfo } from "../sql-context-evaluator";

interface ObjectChild {
  name: string;
  dataType: any;
}

const enum StartingOptions {
  Row = 'row(',
  Map = 'map(',
  Array = 'array(',
  TimeStamp = 'timestamp(',
}

const enum SpecialCharacters {
  OpenParenthesis = '(',
  ClosedParenthesis = ')',
  Comma = ',',
  Space = ' ',
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



export function trinoToJs(trinoObjectAsString: string, index: number):  object|string {
  if (trinoObjectAsString.startsWith(StartingOptions.Row , index)) {
    return processRow(trinoObjectAsString, index + StartingOptions.Row.length);
  }
  if (trinoObjectAsString.startsWith(StartingOptions.Map, index )) {
    return 'map';
  }

  if ( trinoObjectAsString.startsWith(StartingOptions.Array, index ) ) {
    return 'array';
  }
    return trinoObjectAsString;
}

export function processRow(trinoObjectAsString: string, index: number): object {
    const finalObject: object = {};
    let key = "";
    let value = "";
    let objectToInsert;
    let isFirstWord = true;
    const lengthOfSubstring = 5;
  
    while (index <= trinoObjectAsString.length) {
      switch (trinoObjectAsString.charAt(index)) {
        case SpecialCharacters.OpenParenthesis: {
          const start = findBeginningOfWord(trinoObjectAsString, index);
          const result = handleStartingOptions(trinoObjectAsString, start, index);
          objectToInsert = result.objectToInsert;
          finalObject[key] = result.type;
          index = result.newIndex;
          break;
        }
        case SpecialCharacters.ClosedParenthesis: {
          validateKey(key, index);
          finalObject[key] = objectToInsert || value;
          return finalObject;
        }
        case SpecialCharacters.Comma: {
          if (value === "") {
            throw new Error(`Error at index: ${trinoObjectAsString.substring(index-lengthOfSubstring,index)}, type expected before comma`);
          }
          finalObject[key] = objectToInsert || value;
          key = "";
          value = "";
          objectToInsert = undefined;
          isFirstWord = true;
          break;
        }
        case SpecialCharacters.Space: {
          isFirstWord = trinoObjectAsString[index-1] === SpecialCharacters.Comma;
          break;
        }
        default: {
          const charIndex = trinoObjectAsString.charAt(index);
          if (isFirstWord) {
            key += charIndex;
            validateKey(key, index);
          } else {
            value += charIndex;
          }
        }
      }
      index++;
    }
    return {};
  }

export function findBeginningOfWord(str: string, index: number): number {
  while (index > 0 && str[index] !== SpecialCharacters.Space) {
    index--;
  }
  return index;
}

function getOperator(trinoObjectAsString: string, start: number , end: number) {
  return trinoObjectAsString.substring(start+1, end+1); //we are in middle of string start is ' ' 
}

function findClosingParentheses(trinoObjectAsString: string, counter: number): number { 
  let parenthesis = 0;
  for (let i = counter; i < trinoObjectAsString.length; i++) {
    if (trinoObjectAsString.charAt(i) === SpecialCharacters.OpenParenthesis) {
      parenthesis++;
    }
    if (trinoObjectAsString.charAt(i) === SpecialCharacters.ClosedParenthesis) {
      parenthesis--;
    }
    if (parenthesis === 0) {
      return i
    }
  }
  return -1;
}

function handleStartingOptions(trinoObjectAsString: string, start: number, end: number) {
  let objectToInsert;
  let newIndex = end;
  const rowLength = 3;
  const lengthOfSubstring = 5;

  switch (getOperator(trinoObjectAsString, start, end)) {
    case StartingOptions.Row: {
      objectToInsert = trinoToJs(trinoObjectAsString, end - rowLength);
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      break;
    }
    case StartingOptions.Map: {
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      return { objectToInsert, type: "map", newIndex };
    }
    case StartingOptions.Array: {
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      return { objectToInsert, type: "array", newIndex };
    }
    case StartingOptions.TimeStamp:  {
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      return { objectToInsert, type: "timeStamp", newIndex };
    }
    default : {
      throw new Error(`Error at index: ${trinoObjectAsString.substring(end-lengthOfSubstring,end)}`);
    }
  }

  return { objectToInsert, newIndex };
}

function validateKey(key: string, indexInOriginalString: number) {
  const regex = /^[^!@#$%^&*(),.:;\s\n]+$/;

  if (!regex.test(key)) {
      throw new Error(`Error at index: ${indexInOriginalString}, illegal key value`);
  }
}



export function findRelevantPartOfPrefix(tables: TableInfo[] , brokenPrefix: string[]): string {
  let relevantPartOfPrefix = '';

  for (const table of tables) {
      for (const column of table.columns) {
          let found = false;
          let gotRelevantPartOfPrefix = false;

          brokenPrefix.forEach(cell => {
              if (found) {
                  relevantPartOfPrefix += cell + '.';
              }
              if (!gotRelevantPartOfPrefix && cell === column.name) {
                  found = true;
                  gotRelevantPartOfPrefix = true;
                  relevantPartOfPrefix += cell + '.';
              }
          });
          if (relevantPartOfPrefix) {
            return relevantPartOfPrefix;
          }
      }
      if (relevantPartOfPrefix) {
        return relevantPartOfPrefix;
      }
  }

  return relevantPartOfPrefix;
}


function getAllChildrenOfTables(tables: TableInfo[]): any {
  let allChildren = []
  for (const extractedTable of tables) {
    const { columns } = extractedTable;
      columns.forEach((column) => {
        if (typeof column.dataType === "string") {
          column.dataType = trinoToJs(column.dataType, 0);
        }
        if (typeof column.dataType === "object")  {
          allChildren = allChildren.concat(getObjectChildren(column.dataType, column.name));
        }
  });
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
  const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
  const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
  const searchPart = relevantPartOfPrefix.replace(startOfSearch,'')
  const filteredChildren = allChildren.filter(obj => {
  const nameInLowerCase = obj.name.toLowerCase();
  const parts = nameInLowerCase.split('.');
    if (parts.length > 1) {
        const substringAfterFirstDot = parts.slice(1).join('.');
        const criteria = checkCriteria(substringAfterFirstDot , searchPart.toLowerCase());
        const flterIfInDiffrenCollumn = obj.name.startsWith(relevantPartOfPrefix.split('.')[0]);
        return obj.name.includes(startOfSearch) && substringAfterFirstDot.includes(searchPart.toLowerCase()) && criteria && flterIfInDiffrenCollumn ;
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
  const relevantPartOfPrefix = findRelevantPartOfPrefix(tables , prefix.split('.')).slice(0, -1); //if same problem for both change in function itself
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
  const lastDotIndex = substringAfterFirstDot.lastIndexOf('.');
  
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
  const lastDotIndex = inputString.lastIndexOf('.');
  
  if (lastDotIndex !== -1) {
      const prefix = inputString.substring(0, lastDotIndex);
      return prefix;
  }
  
  return inputString;
}