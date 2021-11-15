import { evaluateContext } from './context-evaluator';
import { QueryContext } from './types';

/**
 * Takes query and position and returns the context of the given position in the query 
 * @param   {string} input sql query
 * @param   {number} position to evaluate
 * 
 * @returns {QueryContext} the evaluated context
 */
export const evaluateContextFromPosition = (
  input: string,
  position: number
): QueryContext => {
  const identifier = 'AUTOCOMPLETE_HERE';
  const query = createQueryToEvaluate(input, position, identifier);
  const prefix = getPrefixByPosition(input, position);
  return { ...evaluateContext(query, identifier), prefix };
};

/**
 * Replace the nearest word to the given position in the input with the identifier
 * @param   {string} input 
 * @param   {number} position where to insert
 * @param   {string} identifier string to be inserted
 * 
 * @returns {string} the input after replacement
 */
const createQueryToEvaluate = (
  input: string,
  position: number,
  identifier: string
): string => {
  return position > 0 && position < input.length + 1
    ? removeLastPrefix(input.slice(0, position)) +
        ' ' +
        identifier +
        ' ' +
        input.slice(position)
    : input;
};

/**
 * Removes the last word in the string matches the format (a-z 0-9 .)
 * @param   {string} input 
 * 
 * @returns {string} the input after removal
 */
const removeLastPrefix = (input: string): string => {
  const parts = input.match(/([\w._]+)|([\s,()=<>'`":;*!@#$%^&+-]+)/g);
  if (parts[parts.length - 1].match(/([\w._]+)/)) {
    parts.pop();
  }
  return parts.join('');
};

/**
 * @param   {string} input 
 * @param   {number} position
 * 
 * @returns {string} the nearest prefix that matches the format (a-z 0-9 .) before the given postion
 */
const getPrefixByPosition = (input: string, position: number): string => {
  return input
    .slice(0, position)
    .split(/[\s,()=<>'`":;*!@#$%^&+-]+/)
    .pop();
};
