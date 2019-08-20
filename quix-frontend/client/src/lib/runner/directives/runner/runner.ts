import {initNgScope, inject, srv} from '../../../core';
import {default as createRunner} from '../../services/runner-service';

import template from './runner.html';
import './runner.scss';

function downloadFile(url, fileName) {
  const a = window.document.createElement('A');

  a.setAttribute('href', encodeURI(url));
  a.setAttribute('type', 'text/csv');
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('download', fileName);

  // needed for firefox
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
}

function initRunner(scope, instance: RunnerComponentInstance, mode = 'stream') {
  scope.vm.runner.toggle(true);

  scope.runner = (scope.runner || createRunner(scope.options.type, scope, {
    version: scope.version,
    mode,
    executeBaseUrl: instance.getExecuteBaseUrl()
  })
  .transformRequest(instance.getDataTransformer())
  .transformResponse(instance.getResponseTransformer())
)
  .on('queryCreated', (runner, query) => {
    if (!scope.vm.result.current) {
      scope.vm.result.setCurrent(query);
    }

    query.on('firstResultReceived', () => {
      scope.vm.result.toggle(true);
    });

    query.on('error', (q, {message}) => {
      q.setErrorMessage(instance.getErrorTransformer()(runner, q, message));

      if (message === 'Presto can\'t be reached, please try later. Underlying exception name is SocketTimeoutException') {
        scope.vm.result.queries.get(q).errorType = 'timeout';
      }

      scope.vm.result.setCurrent(q);
      scope.vm.result.toggle(true);
    }, true);
  }, true)
  .on('downloadFile', (url, runner, query) => {
    downloadFile(url, scope.downloadFileName({query, runner}) || 'export.csv');
  })
  .on('finish', runner => {
    scope.vm.runner.toggle(false);

    if (!runner.getState().getStatus().killed) {
      scope.vm.result.toggle(true);
    }
  }, true);

  scope.onRunnerCreated({runner: scope.runner, component: instance});

  return scope.runner;
}

function destroyRunner(scope) {
  kill(scope);

  scope.onRunnerDestroyed({runner: scope.runner});
  scope.runner = null;
}

function destroyResult(scope) {
  scope.vm.result.toggle(false);
  scope.vm.result.reset();
}

function destroy(scope) {
  destroyRunner(scope);
  destroyResult(scope);
}

function kill(scope, notify = false) {
  if (scope.runner) {
    scope.runner.kill();

    if (notify) {
      scope.onRunnerKilled({runner: scope.runner});
    }
  }

  scope.vm.runner.toggle(false);
}

function renderResult(scope, queryScope, query, tableFormatter, transclude) {
  if (!transclude.isSlotFilled('result')) {
    queryScope.query = query;
    queryScope.tableFormatter = tableFormatter;

    return inject('$compile')(`
      <bi-viz
        class="bi-c-h bi-grow"
        data="query.getResults().buffer"
        table-data="query.getResults()"
        fields="query.getRawFields()"
        table-fields="query.getFields()"
        is-partial="query.running"
        bv-options="::{picker: true}"
        table-formatter="tableFormatter()"
        $state="$state"
      ></bi-viz>
    `)(queryScope);
  }

  return transclude((_, _scope) => _scope.query = query, null, 'result');
}

export class RunnerComponentInstance extends srv.eventEmitter.EventEmitter {
  private user;
  private dataTransformer: Function;
  private responseTransformer: Function;
  private errorTransformer: Function = (runner, query, error) => error;
  private executeBaseUrl: string;

  constructor(private readonly scope) {
    super();
  }

  run(mode: 'stream' | 'download' = 'stream') {
    return this.scope.events.onToggleRun(mode);
  }

  getDataTransformer() {
    return this.dataTransformer;
  }

  getResponseTransformer() {
    return this.responseTransformer;
  }

  getErrorTransformer() {
    return this.errorTransformer;
  }

  getExecuteBaseUrl() {
    return this.executeBaseUrl;
  }

  setRequestTransformer(fn: (code) => typeof code) {
    this.dataTransformer = fn;
  }

  setResponseTransformer(fn: (response) => typeof response) {
    this.responseTransformer = fn;
  }

  setErrorTransformer(fn: (runner, query, error) => typeof error) {
    this.errorTransformer = (runner, query, error) => fn(runner, query, error);
  }

  setExecuteBaseUrl(baseUrl: string) {
    this.executeBaseUrl = baseUrl;
  }

  setCurrentQuery(query) {
    this.scope.vm.result.setCurrent(query);
  }

  getUser() {
    return this.user;
  }

  setUser(user) {
    this.user = user;
  }

  load(runner) {
    destroy(this.scope);
    this.scope.runner = runner;
    initRunner(this.scope, this);
  }
}

export default () => {
  return {
    restrict: 'E',
    template,
    transclude: {
      editor: 'editor',
      actions: '?actions',
      result: '?result',
      runHint: '?runHint',
      controls: '?controls',
    },
    scope: {
      data: '=',
      version: '=',
      runner: '<',
      brOptions: '<',
      onRun: '&',
      onRunnerCreated: '&',
      onRunnerKilled: '&',
      onRunnerDestroyed: '&',
      onLoad: '&',
      tableFormatter: '&',
      downloadFileName: '&',
      $state: '<'
    },

    link: {
      pre(scope, element, attrs, ctrl, transclude) {
        const instance = new RunnerComponentInstance(scope);

        initNgScope(scope)
          .withOptions('brOptions', {
            type: 'presto',
            buttonText: 'Run',
            disableCustomActions: false
          }, true)
          .withVM({
            runner: {},
            result: {
              csvFileName: null,
              $init() {
                this.current = null;
                this.queries = this.createItemsVm({
                  errorType: null
                });
              },
              setCurrent(query) {
                this.current = query;
                this.queries.get(query).toggle(true);
                this.csvFileName = scope.downloadFileName({query, runner: scope.runner}) || 'export.csv';
              },
              reset() {
                this.$init();
              }
            },
            tabs: {
              isEnabled() {
                return scope.vm.result.enabled && scope.runner.getTotalNumOfQueries() > 1;
              }
            },
            customActions: {
              $init() {
                this.toggle(transclude.isSlotFilled('actions'));
              }
            }
          })
          .withEvents({
            onSelectQuery(query) {
              scope.vm.result.setCurrent(query);
            },
            onToggleRun(mode) {
              if (scope.vm.runner.enabled) {
                kill(scope, true);
              } else {
                destroy(scope);
                const runner = initRunner(scope, instance, mode).run(scope.data, instance.getUser());

                scope.onRun({runner});

                return runner;
              }
            },
            onCloseResult() {
              destroy(scope);
            }
          })
          .withActions({
            getCsvFields() {
              return scope.vm.result.current.getFields().map(field => field.title);
            },
            getCsvRows() {
              const fields = scope.vm.result.current.getFields();
              return scope.vm.result.current.getResults().buffer.map(row => fields.map(field => row[field.name]));
            }
          });

        if (scope.runner) {
          initRunner(scope, instance);
        }

        scope.renderResult = (queryScope, query) => ({html: renderResult(scope, queryScope, query, scope.tableFormatter, transclude)});

        scope.onLoad({instance});
      }
    }
  };
};
