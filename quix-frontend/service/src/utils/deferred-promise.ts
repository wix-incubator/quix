export function defer<T = any>() {
  let resolve: any;
  let reject: any;
  const promise = new Promise<T>((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  });
  return {
    resolve,
    reject,
    resolveByPromise(p: Promise<T>) {
      p.then(v => resolve(v)).catch(e => reject(e));
    },
    promise,
  } as {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason: any) => void;
    promise: Promise<T>;
  };
}
