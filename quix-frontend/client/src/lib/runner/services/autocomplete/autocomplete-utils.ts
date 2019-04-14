/* tslint:disable:no-bitwise */

/**
 * create an array of bitmaps.
 *  if ((bit j of array[i]) === 1) means that the character i*31 + j should be marked in UI
 *
 * @param {number} start
 * @param {number} length
 * @returns {number[]}
 */
export function createMatchMask(start: number, length: number): number[] {
  const res = [];

  for (let i = start; i < start + length; i++) {
    const index = i % 31;
    const offset = i - (31 * index);
    res[index] = res[index] || 0;
    res[index] = res[index] | 1 << offset;
  }

  return res;
}

export const makeCompletionItem = (value: string, meta: string) => {
  // const completer = Object.create(loggerPrototype);
  const completer = {value, meta};
  return completer;
};
