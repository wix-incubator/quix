/// <reference types="angular" />
import * as angular from 'angular';

declare module 'angular' {
  export interface IPromise<T> {
    then<TResult = T, TResult2 = never>(successCallback: (promiseValue: T) => PromiseLike<TResult> | TResult, errorCallback?: (reason: any) => TResult2, notifyCallback?: (state: any) => any): IPromise<TResult | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
  }
}
