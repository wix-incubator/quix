import {SyncHook, AsyncSeriesHook} from 'tapable';

export const hooks = {
  bootstrap: new SyncHook(['appBuilder']),
  note: {
    plugin: new SyncHook(['app', 'store', 'engine', 'id']),
    import: new AsyncSeriesHook(['app', 'store', 'note', 'value']),
    runFinish: new SyncHook(['app', 'store', 'note', 'runner']),
  },
};
