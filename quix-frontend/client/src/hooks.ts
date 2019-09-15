import {SyncHook} from 'tapable';

export const hooks = {
  bootstrap: new SyncHook(['appBuilder']),
};
