import {findIndex} from 'lodash';

export const extractTextAroundMatch = (text: string, match: string, numOfWrappingLines = 1) => {
  const lines = text.split('\n');
  const index = findIndex(lines, line => line.indexOf(match) !== -1);

  return lines
    .slice(Math.max(0, index - numOfWrappingLines), Math.min(lines.length, index + 1 + numOfWrappingLines))
    .join('\n');
}