declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchArrayAnyOrder(expected: any): R;
    }
  }
}

expect.extend({
  toMatchArrayAnyOrder(x: any[], y: any[], z = 'id') {
    const sortFn = (a: any, b: any) => (a[z] as string).localeCompare(b[z]);
    const arr1Sorted = x.sort(sortFn);
    const arr2Sorted = y.sort(sortFn);
    const diff: any = {};
    const pass = arr1Sorted.every((item, index) => {
      const isEqual = this.equals(
        expect.objectContaining(arr2Sorted[index]),
        item,
      );
      if (!isEqual) {
        diff.index = index;
        diff.a = item;
        diff.b = arr2Sorted[index];
      }
      return isEqual;
    });
    return {
      pass,
      message: () => {
        if (this.isNot) {
          return 'Arrays are equal.';
        } else {
          return `Items don't match in index ${diff.index}
Expected:
${this.utils.printExpected(diff.a)}
Received:
${this.utils.printReceived(diff.b)}
`;
        }
      },
    };
  },
});

export const dummyVar = 'just to make this a module';
