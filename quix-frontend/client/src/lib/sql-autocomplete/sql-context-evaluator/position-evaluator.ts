import { evaluateContext } from './context-evaluator';
import { QueryContext } from './types';

export const evaluateContextFromPosition = (
  input: string,
  position: number
): QueryContext => {
  const identifier = 'AUTOCOMPLETE_HERE';
  const query = createQueryToEvaluate(input, position, identifier);
  const prefix = getPrefixByPosition(input, position);
  return { ...evaluateContext(query, identifier), prefix };
};

const createQueryToEvaluate = (
  input: string,
  position: number,
  identifier: string
) => {
  return position > 0 && position < input.length + 1
    ? removePrefix(input.slice(0, position)) +
        ' ' +
        identifier +
        ' ' +
        input.slice(position)
    : input;
};

const removePrefix = (input: string) => {
  const parts = input.match(/([\w._]+)|([\s,()=<>'`":;*!@#$%^&+-]+)/g);
  if (parts[parts.length - 1].match(/([\w._]+)/)) {
    parts.pop();
  }
  return parts.join('');
};

const getPrefixByPosition = (input: string, position: number): string => {
  return input
    .slice(0, position)
    .split(/[\s,()=<>'`":;*!@#$%^&+-]+/)
    .pop();
};
