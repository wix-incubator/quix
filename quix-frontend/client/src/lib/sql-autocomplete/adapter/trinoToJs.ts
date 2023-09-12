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

function findBeginningOfWord(str: string, index: number): number {
  while (index > 0 && str[index] !== SpecialCharacters.Space) {
    index--;
  }
  return index;
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
  const forbiddenChars = /^[^!@#$%^&*(),.:;\s\n]+$/;

  if (!forbiddenChars.test(key)) {
      throw new Error(`Error at index: ${indexInOriginalString}, illegal key value`);
  }
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