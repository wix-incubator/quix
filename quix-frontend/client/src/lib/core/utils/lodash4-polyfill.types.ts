declare module _ {
  interface LoDashStatic {

     cloneDeepWith: <TResult>(
       value: any,
       customizer: CloneDeepCustomizer<any, TResult>
     ) => TResult;
  }
}
