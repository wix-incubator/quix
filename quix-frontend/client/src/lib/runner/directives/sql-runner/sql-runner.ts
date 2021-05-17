import './sql-runner.scss';
import template from './sql-runner.html';

import {CodeEditorInstance} from '../../../code-editor';
import {createNgModel, initNgScope, inject} from '../../../core';
import {setupCompleters} from '../../services/autocomplete/autocomplete-service';
import {attachErrorHandler, getParamsOffset} from '../../services/syntax-valdator/syntax-validator-service';
import {initSqlWorker} from '../../services/workers/sql-parser-worker';
import {RunnerComponentInstance} from '../runner/runner';
import {requestCredentials, isPermissionError} from '../../services/permissions/permissions-service';
import {config} from '../../config';
import { AUTO_PARAMS, AUTO_PARAM_TYPES } from '../../../code-editor/services/param-parser/param-types';

function renderActions(scope, editorComponentInstance, runnerComponentInstance, transclude: ng.ITranscludeFunction) {
  if (!transclude.isSlotFilled('actions')) {
    return inject('$compile')(`
      <ul class="bi-dropdown-menu">
        <li class="bi-align bi-s-h--x05" ng-click="events.onRunAndDownload()">
          <i class="bi-icon">file_download</i>
          <div>Run and download</div>
        </li>
      </ul>
    `)(scope);
  }

  return transclude((_, s) => {
    s.editorComponentInstance = editorComponentInstance;
    s.runnerComponentInstance = runnerComponentInstance;
  }, null, 'actions');
}

export default () => {
  return {
    restrict: 'E',
    template,
    require: 'ngModel',
    transclude: {
      actions: '?actions',
      controls: '?controls',
      stats: '?stats',
    },
    scope: {
      version: '=',
      type: '=',
      runner: '=',
      bsrOptions: '=',
      onEditorLoad: '&',
      onRunnerLoad: '&',
      onSave: '&',
      onRun: '&',
      onRunnerCreated: '&',
      onRunnerDestroyed: '&',
      onParamsShare: '&',
      tableFormatter: '&',
      downloadFileName: '&',
      readonly: '=',
      $state: '<'
    },

    link: {
      pre(scope, element, attrs, ngModel, transclude) {
        let editorInstance: CodeEditorInstance, runnerInstance: RunnerComponentInstance;
        const deferredEditor = inject('$q').defer();

        const modelConf = createNgModel(scope, ngModel)
          .formatWith(model => ({value: model}))
          .parseWith(({value}) => value)
          .watchDeep(true)
          .then(() => scope.vm.toggle(true));

        initNgScope(scope)
          .withOptions('bsrOptions', {
            focus: false,
            params: false,
            autoParams: true,
            customParams: true,
            useAutocomplete: true,
            showSyntaxErrors: true,
            promptOnPermissionError: true,
            disableCustomActions: false,
            fitContent: false,
            shareParams: false,
            autoRun: false,
            dateFormat: null,
          })
          .withVM({
            selection: null,
            password: null,
            runnerOptions: {
              buttonText: null
            },
            hint: {
              run: {
                enabled: true
              }
            },
            viz: {
              $init() {
                this.queries = this.createItemsVm({
                  type: null,
                  setCurrent(type) {
                    this.type = type;
                  },
                  $init() {
                    this.setCurrent('table');
                  }
                });
              }
            }
          })
          .withEvents({
            onRunnerLoad(instance: RunnerComponentInstance) {
              runnerInstance = instance;

              runnerInstance.setRequestTransformer(() => editorInstance.getParams().format(scope.vm.selection || scope.model.value));

              runnerInstance.setErrorTransformer((runner, query, msg) => {
                if (isPermissionError(msg) && scope.options.promptOnPermissionError) {
                  requestCredentials(scope, runnerInstance).then(() => runnerInstance.run());
                } else {
                  const match = msg.match(/^line (\d+)\:\d+/);

                  if (match) {
                    const queryOffset: number = runner.getQueries().reduce((res, _query) => {
                      if (_query !== query) {
                        res += _query.meta('numOfRows');
                      }

                      return res;
                    }, getParamsOffset(editorInstance));

                    const rowNumber = queryOffset + parseInt(match[1], 10) + (editorInstance.getSelection().getOffset() as number);
                    msg = msg.replace(/^(line )(\d+)(\:\d+)/, `$1${rowNumber}$3`);

                    editorInstance.getAnnotator().showError(rowNumber, msg);
                  }
                }

                return msg;
              });

              scope.onRunnerLoad({instance});
            },
            onEditorLoad(instance: CodeEditorInstance) {
              editorInstance = instance;
              deferredEditor.resolve(instance);

              editorInstance.addShortcut('Ctrl-Enter', 'Command-Enter', () => runnerInstance.run(), scope);
              editorInstance.getSelection()
                .on('select', text => {
                  scope.vm.selection = text;
                  scope.vm.runnerOptions.buttonText = 'Run selection';
                })
                .on('deselect', () => {
                  scope.vm.selection = null;
                  scope.vm.runnerOptions.buttonText = null;
                });

              if (scope.options.params) {
                editorInstance.addLiveCompleter('$', prefix => {
                  let completions = [];
                  const params = editorInstance.getParams();

                  if (scope.options.autoParams) {
                    completions = [
                      ...completions,
                      ...AUTO_PARAMS
                        .map(name => ({name, meta: AUTO_PARAM_TYPES[name]}))
                        .map(({name, meta}) => ({
                          caption: name,
                          value: params.getParser().getSerializer().serialize({
                            match: null,
                            key: name,
                            type: null,
                            value: null,
                            isAutoParam: true,
                            isKeyOnlyParam: false,
                            options: null
                          }),
                        meta,
                        completer: {
                          insertMatch(editor) {
                            editor.insert(name);
                            editorInstance.getParams().addAutoParam(name);
                          }
                        }
                      }))
                    ];
                  }

                  if (scope.options.customParams) {
                    completions = [
                      ...completions,
                      ...params.getParams().filter(({isAutoParam}) => !isAutoParam).map(({key, type, value}) => {
                        return {
                          caption: key,
                          value: params.getParser().getSerializer().serialize({
                            match: null,
                            key,
                            type,
                            value,
                            isAutoParam: false,
                            isKeyOnlyParam: true,
                            options: null
                          }), meta: type
                        };
                      })
                    ];
                  }

                  return completions;
                });
              }

              runnerInstance.on('error', (rowNumber, msg) => editorInstance.getAnnotator().showError(rowNumber, msg));

              if (!scope.readonly && scope.options.useAutocomplete) {
                setupCompleters(editorInstance, scope.type, config.get().apiBasePath).catch(console.error);
              }

              if (!scope.readonly && scope.options.showSyntaxErrors) {
                attachErrorHandler(initSqlWorker, editorInstance, modelConf).catch(console.error);
              }

              scope.onEditorLoad({instance});
            },
            onRunnerCreated(runner) {
              runner
                .on('success', () => deferredEditor.promise.then((editor: CodeEditorInstance) => editor.setValid(true), true))
                .on('error', () => deferredEditor.promise.then((editor: CodeEditorInstance) => editor.setValid(false), true));

              runner.getEvents().register('query-details', data => {
                const code = data && data.code || '';
                const lines = code.trim().split('\n');

                runner.getCurrentQuery().meta('numOfRows', lines.length);
                runner.getCurrentQuery().setTitle(lines[0] ? lines[0].replace('--', '').trim() : 'query');

                return data;
              });

              scope.vm.hint.run.toggle(false);
              scope.onRunnerCreated({runner});
            },
            onRunnerDestroyed(runner) {
              deferredEditor.promise.then(() => {
                editorInstance.setValid(null);
                editorInstance.getAnnotator().hideAll();
              });

              scope.vm.hint.run.toggle(true);
              scope.onRunnerDestroyed({runner});
            },
            onRun(runner) {
              scope.onRun({runner});
            },
            onRunAndDownload() {
              runnerInstance.run('download');
            }
          });

        scope.renderActions = () => ({html: renderActions(scope, editorInstance, runnerInstance, transclude)});
      }
    }
  };
};
