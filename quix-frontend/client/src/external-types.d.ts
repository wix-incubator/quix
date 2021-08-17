//declare module '*.scss';
//declare module '*.json';
import 'yoshi/types';
declare module '*.html';
declare var browser: any;

declare global {
  namespace NodeJS {
    interface Global {
      browser: any;
    }
  }
}

declare global {
  interface Window {
    quixConfig: any;
  }

  interface DedicatedWorkerGlobalScope {}
}
