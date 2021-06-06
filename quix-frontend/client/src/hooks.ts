import {SyncHook, AsyncSeriesHook, SyncWaterfallHook} from 'tapable';

export const hooks = {
  bootstrap: new SyncHook(['appBuilder']),
  note: {
    plugin: new SyncWaterfallHook(['app', 'store', 'engine', 'id']),
    import: new AsyncSeriesHook(['app', 'store', 'note', 'value']),
    runFinish: new SyncHook(['app', 'store', 'note', 'runner']),
    results: {
      formatters: {
        pre: new SyncWaterfallHook(['res', 'app', 'store', 'engine', 'id']),
        post: new SyncWaterfallHook(['res', 'app', 'store', 'engine', 'id']),
      },
    },
    config: {
      editor: {
        autoParams: new SyncWaterfallHook(['app', 'store']),
      }
    }
  },
};
