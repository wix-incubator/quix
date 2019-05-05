import {debounce, pull, find, clone, flatten, last} from 'lodash';
import {utils} from '../../core';
import {UndoManager} from 'brace';
import {ParamParser, TType, IParam} from './param-parser';
import {paramSerializerFactory} from './param-parser/param-serializers';
import CodeEditor from './code-editor-service';
import { AUTO_PARAM_TYPES, AUTO_PARAM_DEFAULTS } from './param-parser/param-types';

export default class CodeEditorParams {
  private params: IParam[] = [];
  private readonly parser: ParamParser;
  private mute = false;
  private folded = false;
  private readonly paramOverrides: {[key: string]: Partial<IParam>} = {};
  private readonly parserOptions: {customParamsEnabled: boolean};

  constructor(private readonly editor: CodeEditor, private readonly ace, private readonly options, private readonly scope) {
    const type = last(`${options.ace.mode}`.split('/'));
    this.parser = new ParamParser(paramSerializerFactory(type));

    if (!options.params) {
      return;
    }

    this.parserOptions = {customParamsEnabled: this.options.customParams};

    this.init(scope);
  }

  private init(scope) {
    this.params = this.parser.params(this.editor.getValue(), this.parserOptions);
    this.syncParams();
    this.ace.getSession().setUndoManager(new UndoManager());  // reset undo stack
    this.mute = false;

    this.editor.on('change', debounce((value, {isInLockRange, isMultilineInsert}) => {
      if (this.mute) {
        this.mute = false;
        return;
      }

      if (isInLockRange || isMultilineInsert) {
        utils.scope.safeApply(scope, () => {
          this.params = this.parser.params(value, this.parserOptions, this.getParams());
          this.setLock(this.getParser().getSerializer().getLockRange(value));
        });
      }
    }, 100));
  }

  private replace(text, needle, replacement): string {
    if (needle === replacement) {
      return text;
    }

    this.mute = true;

    if (text === '') {
      this.editor.setValue(replacement);
    } else {
      this.ace.replaceAll(replacement, {needle});
    }

    return this.editor.getValue();
  }

  private setLock(ranges: [number, number][]) {
    this.editor.unlockLines();

    if (this.hasParams()) {
      this.editor.lockLines(ranges);
    }
  }

  private setFold(ranges: [number, number][]) {
    if (!this.hasParams()) {
      return;
    }

    let foldRange = flatten(ranges);
    foldRange = [foldRange[0], foldRange[foldRange.length - 1]];

    if (!this.folded) {
      this.folded = true;
      setTimeout(() => this.ace.getSession().foldAll(...foldRange));
    } else {
      this.ace.getSession().foldAll(...foldRange);
    }
  }

  getParser(): ParamParser {
    return this.parser;
  }

  getParams(): IParam[] {
    return this.params;
  }

  hasParams(): boolean {
    return !!this.getParams().length;
  }

  addParam(key: string, type: TType, value, options?: string[]): CodeEditorParams {
    if (!find(this.getParams(), {key})) {
      this.getParams().push(this.parser.createParam(key, type, value, options));
      this.syncParams();
    }

    return this;
  }

  addAutoParam(key: string): CodeEditorParams {
    this.addParam(key, AUTO_PARAM_TYPES[key], AUTO_PARAM_DEFAULTS[key]);

    return this;
  }

  removeParam(key: string): CodeEditorParams {
    pull(this.getParams(), find(this.getParams(), {key}));
    this.syncParams();

    return this;
  }

  removeAllParams(): CodeEditorParams {
    this.params = [];
    this.syncParams();

    return this;
  }

  getParamOverrides(key: string) {
    return this.paramOverrides[key];
  }

  overrideParam(key: string, param: Partial<IParam>): CodeEditorParams {
    this.paramOverrides[key] = param;

    if (typeof param.value !== 'undefined') {
      const p = find(this.params, {key});
      p.value = param.value;
    }

    // trigger watchers
    utils.scope.safeApply(this.scope, () => {
      this.params = this.params.map((p: any) => {
        delete p.$$hashKey;
        return clone(p);
      });
    });

    return this;
  }

  /**
   * Sync params array to editor
   */
  syncParams() {
    const ranges = this.parser.sync(this.editor.getValue(), this.getParams(), this.parserOptions, (text, needle, replacement) => {
      return this.replace(text, needle, replacement);
    });

    this.setLock(ranges);
    this.setFold(ranges);

    return ranges;
  }

  /**
   * Replaces params in text with their respective values
   */
  format(text?: string): string {
    return this.parser.format(typeof text !== 'undefined' ? text : this.editor.getValue(), this.getParams(), {
      customParamsEnabled: this.options.customParams,
      keepEmbed: false
    });
  }

  formatEmbed(options?): string {
    const embed = this.getParser().getSerializer().extract(this.editor.getValue(), options);

    return this.parser.format(embed, this.getParams(), {
      customParamsEnabled: this.options.customParams,
      keepEmbed: true
    });
  }
}
