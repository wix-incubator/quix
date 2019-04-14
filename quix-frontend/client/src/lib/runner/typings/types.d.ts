declare module '*.scss';
declare module '*.html';
interface DedicatedWorkerGlobalScope {}
interface Promise<T> {
  finally(finallyCallback: () => any): Promise<T>; /* lets pretend we have this in es6, makes it comptabile with ng.Ipromise */
}
