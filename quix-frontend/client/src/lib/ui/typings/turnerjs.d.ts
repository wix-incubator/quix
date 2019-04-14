/// <reference path="../../node_modules/turnerjs/module/generated/turnerjs-driver.d.ts" />
declare class __TurnerComponentDriver__ extends TurnerComponentDriver {}
declare module 'turnerjs' {
  export class TurnerComponentDriver extends __TurnerComponentDriver__ {}
}