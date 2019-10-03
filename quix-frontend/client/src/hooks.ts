import {SyncHook, AsyncSeriesHook} from 'tapable';

export const hooks = {
  bootstrap: new SyncHook(['appBuilder']),
  note: {
    import: new AsyncSeriesHook(['store', 'note', 'value']),
    runFinish: new SyncHook(['app', 'store', 'note', 'runner']),
  },
};
