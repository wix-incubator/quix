import template from './code-editor.html';
import './code-editor.scss';

import {uniq} from 'lodash';
import jquery from 'jquery';
import {IScope} from 'angular';
import {utils, createNgModel, initNgScope, inject} from '../../core';
import CodeEditor from '../services/code-editor-service';
import Instance from '../services/code-editor-instance';
import {IParam, ParamParser} from '../services/param-parser';
import {renderParam} from '../services/param-parser/param-renderers';
import {showToast} from '../../../lib/ui/services/toast';

const {safeApply} = utils.scope;

function initEditor(scope, element, container, text) {
  const editor = new CodeEditor(scope, container, text, scope.options);

  editor
    .on('change', value => !scope.readonly && safeApply(scope, () => scope.model = value))
    .on('validToggle', valid => {
      container.parent().removeClass('bce-valid bce-invalid');
      container.parent().addClass({true: 'bce-valid', false: 'bce-invalid'}[valid]);
    })
    .on('resize', () => element.toggleClass('bce-narrow', element.width() < 1000));

  scope.$watch('readonly', (readonly = false) =>  {
    editor.setReadonly(readonly);
    container.toggleClass('bce-readonly', readonly);
  });

  editor.getShortcuts().addShortcut('Ctrl-S', 'Command-S', () => scope.onSave(), scope);

  return editor;
}

function exportParams(editor: CodeEditor) {
  const params = editor.getParams();
  const serializer = params.getParser().getSerializer();

  return params.getParams().reduce((res, {key, value}) => {
    res[`var_${key}`] = serializer.toString(value);
    return res;
  }, {});
}

function importParams(editor: CodeEditor, urlImports) {
  const params = editor.getParams();
  const serializer = params.getParser().getSerializer();

  params.getParams().forEach(({key, value, type}) => {
    const urlParam = urlImports[`var_${key}`];

    if (typeof urlParam === 'undefined') {
      return;
    }

    params.overrideParam(key, {value: serializer.toJs(urlParam, type) || null});
  });
}

function render(scope, element, text, editor: CodeEditor, urlImports): CodeEditor {
  if (!editor) {
    editor = initEditor(scope, element, element.find('.bce-editor-container'), text);

    if (editor.getParams().hasParams()) {
      importParams(editor, urlImports);
    } else {
      scope.vm.params.toggleVisible(false);
    }

    scope.vm.param.types = ParamParser.TYPES;
    scope.vm.param.autoParams = ParamParser.AUTO_PARAMS;
  } else {
    editor.setValue(text);
  }

  return editor;
}

export default () => {
  return {
    restrict: 'E',
    template,
    require: 'ngModel',
    scope: {
      onSave: '&',
      onLoad: '&',
      readonly: '=',
      bceOptions: '<'
    },

    link: {
      pre (scope: IScope & {model: string}, element, attrs, ngModel) {
        let editor: CodeEditor;
        let urlImports = {};

        createNgModel(scope, ngModel)
          .renderWith(text => editor = render(scope, element, text, editor, urlImports))
          .then(() => scope.onLoad({instance: new Instance(editor, scope)}));

        initNgScope(scope)
          .withOptions('bceOptions', {
            ace: {},
            focus: false,
            params: false,
            customParams: true,
            fitContent: false
          })
          .withVM({
            param: {
              types: [],
              kinds: ['auto', 'custom'],
              current: null,
              $init() {
                this.init();
              },
              init() {
                this.model = {
                  key: '',
                  type: (this.model && this.model.type) || 'string',
                  options: undefined
                };
              }
            },
            params: {
              visible: true,
              $init() {
                Object.defineProperty(this, 'all', {
                  get() {
                    return editor && editor.getParams().getParams();
                  }
                });
              },
              $export(provider) {
                if (provider === 'url') {
                  return exportParams(editor);
                } 
                  return {paramsOpen: this.visible};
                
              },
              $import(obj) {
                urlImports = obj;

                if (typeof obj.paramsOpen === 'boolean') {
                  this.toggleVisible(obj.paramsOpen);
                }
              }
            }
          })
          .withEvents({
            onParamChange() {
              inject('$timeout')(() => editor.getParams().syncParams());
            },
            onParamsToggle() {
              scope.vm.params.toggleVisible();
              scope.state.save();
            },
            onParamAdd() {
              const {key, type, options} = scope.vm.param.model;

              editor.getParams().addParam(key, type, undefined, uniq(options));
              scope.vm.param.init();
            },
            onParamRemove({key}) {
              editor.getParams().removeParam(key);
            },
            onShareClick() {
              const input = jquery('<input>')
                // tslint:disable-next-line: restrict-plus-operands
                .val(window.location.href.split('?')[0] + '?' + scope.state.state.exportAsURL('url'));

              input.appendTo(window.document.body);
              input.get(0).focus();
              (input.get(0) as any).select();
              document.execCommand('Copy');
              input.remove();

              showToast({text: 'Copied share url to clipboard', hideDelay: 3000});
            }
          })
          .withState('bce', 'bce', {});

        scope.renderParam = (param: IParam) => ({html: renderParam(scope, param, editor.getParams().getParamOverrides(param.key))});

        if (!scope.options.customParams) {
          inject('$timeout')(() => element.find('.bce-custom-param-toggle').remove());
        }

        // this is needed because angular directives dont work inside be-controls
        element.on('mousedown', '.bce-custom-param-toggle, .bce-auto-param-toggle', (e) => {
          const target = jquery(e.currentTarget);

          utils.scope.safeApply(scope, () => {
            scope.vm.param.current = target.is('.bce-custom-param-toggle') ? 'custom' : 'auto';
          });
        });

        scope.$on('$destroy', () => editor.destroy());
      }
    }
  };
};
