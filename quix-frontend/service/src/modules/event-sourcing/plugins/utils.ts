import {IAction} from '../infrastructure/types';
import {BadAction} from 'errors';
import {last} from 'lodash';

/**
 * gets enums, and extracts only the actual values from them
 * @param enums Enums or "Fake enums" (Record<string, string>)
 */
export const extractEventNames = (...enums: Record<string, string>[]) =>
  enums
    .reduce(
      (result, anEnum) => result.concat(Object.entries<string>(anEnum)),
      [] as [string, string][],
    )
    .map(([typeSymbol, typeString]) => typeString);

export function lastAndAssertExist<T>(
  arr: T[],
  action: IAction,
  error?: string,
): T {
  const item = last(arr);
  if (!item) {
    throw BadAction(action.type, error || 'path property should be an array');
  }
  return item;
}

export function assertOwner<T extends {owner: string}>(
  obj: T,
  action: IAction,
  error?: string,
) {
  if (obj.owner !== action.user) {
    throw BadAction(
      action.type,
      error || 'entity owner is not the user dispatching the action',
    );
  }
}

export function assert<T, A extends IAction>(
  t: T,
  action: A,
  fn: (t: T, action: A) => boolean,
  error: string,
) {
  if (!fn(t, action)) {
    throw BadAction(action.type, error);
  }
}
