export function retry<R>(what: () => Promise<R>) {
  return {
    forNTimes: (n: number) => ({
      andWaitXMilliseconds: async (milliseconds: number) => {
        let counter = 0;
        let error: Error | null = null;
        let result: R = {} as any;
        while (counter < n) {
          await what()
            .then(r => {
              result = r;
              error = null;
            })
            .catch(e => {
              error = e;
              return undefined;
            });
          if (error) {
            counter++;
            await new Promise(resolve => setTimeout(resolve, milliseconds));
          } else {
            return result;
          }
        }
        throw error;
      },
    }),
  };
}
