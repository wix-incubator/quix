import {SyncHook, AsyncSeriesHook, SyncWaterfallHook} from 'tapable';

export const hooks = {
  bootstrap: new SyncHook(['appBuilder']),
  note: {
    plugin: new SyncWaterfallHook(['app', 'store', 'engine', 'id']),
    import: new AsyncSeriesHook(['app', 'store', 'note', 'value']),
    runStart: new SyncHook(['app', 'store', 'note', 'runner']),
    runFinish: new SyncHook(['app', 'store', 'note', 'runner']),
    results: {
      formatters: {
        pre: new SyncWaterfallHook(['res', 'app', 'store', 'engine', 'id']),
        post: new SyncWaterfallHook(['res', 'app', 'store', 'engine', 'id']),
      },
      viz: new SyncWaterfallHook(['app', 'store', 'engine']),
    },
    config: {
      editor: {
        autoParams: new SyncWaterfallHook(['app', 'store']),
        autocompleteDbFetchers: new SyncWaterfallHook(['app', 'store', 'engine']),
      }
    }
  },
};
