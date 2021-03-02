import {findIndex} from 'lodash';

export const extractTextAroundMatch = (text: string, match: string, numOfWrappingLines = 2) => {
  match = match.toLowerCase();

  const lines = text.split('\n');
  const index = findIndex(lines, line => line.toLowerCase().indexOf(match) !== -1);

  return lines
    .slice(Math.max(0, index - numOfWrappingLines), Math.min(lines.length, index + 1 + numOfWrappingLines))
    .join('\n');
}

export const highlightText = (term: string, filter: string) => {
  const text = term.replace(/\s+/g,' ');
  const currentFilter = filter;
  const needlePresent = !!currentFilter;
  const wrapLinesCount = needlePresent ? 1 : 0;

  return {
    currentFilter,
    textToHighlight: extractTextAroundMatch(text, currentFilter || '', wrapLinesCount)
  };
}