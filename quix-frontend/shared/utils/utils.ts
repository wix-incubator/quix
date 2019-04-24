import {findIndex} from 'lodash';

export const replaceWith = (collection: any[], predicate: Record<string, any>, value: (current: any) => any) => {
  const index = findIndex(collection, predicate);

  if (index === -1) {
    return collection;
  }

  collection.splice(index, 1, value(collection[index]));

  return [...collection];
}
