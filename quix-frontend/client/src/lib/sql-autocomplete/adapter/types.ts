import { QueryContext } from '../sql-context-evaluator/types';

export type IContextEvaluator = (input: string, position: number) => any;

export interface IAutocompleter {
  getCompletionItemsFromQueryContext(queryContext: QueryContext): any;
}

