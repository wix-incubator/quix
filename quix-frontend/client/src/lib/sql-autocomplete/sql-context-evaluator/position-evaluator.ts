import evaluateContext from './context-evaluator';
import { QueryContext } from './types';

const evaluateContextFromPosition = (
  input: string,
  position: number
): QueryContext => {
  const identifier = 'AUTOCOMPLETE_HERE';
  const query = createQueryToEvaluate(input, position, identifier);
  return evaluateContext(query, identifier);
};

const createQueryToEvaluate = (
  input: string,
  position: number,
  identifier: string
) => {
  return position > 0 && position < input.length + 1
    ? input.slice(0, position) + ' ' + identifier + ' ' + input.slice(position)
    : input;
};

export default evaluateContextFromPosition;
