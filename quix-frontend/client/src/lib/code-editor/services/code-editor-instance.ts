import {utils, srv} from '../../core';
import CodeEditor from './code-editor-service';
import {ICompleterFn} from './code-editor-completer';
import {default as Annotator} from './code-editor-annotator';
import {default as Selection} from './code-editor-selection';
import {default as Params} from './code-editor-params';

const {safeApply} = utils.scope;

export default class CodeEditorInstance extends srv.eventEmitter.EventEmitter {
  constructor(private readonly editor: CodeEditor, scope) {
    super();

    editor.getSelection()
      .on('select', text => safeApply(scope, () => this.fire('select', text)))
      .on('deselect', () => safeApply(scope, () => this.fire('deselect')));
  }

  setValid(valid: boolean): CodeEditorInstance {
    this.editor.setValid(valid);

    return this;
  }

  addLiveCompleter(prefix: string, fn: ICompleterFn): CodeEditorInstance {
    this.editor.getCompleter().addLiveCompleter(prefix, fn);

    return this;
  }

  addOnDemandCompleter(identifierRegex: RegExp, fn: ICompleterFn, options?: {prefix?: string; acceptEmptyString?: boolean; linePredicate?: any }): CodeEditorInstance {
    this.editor.getCompleter().addOnDemandCompleter(identifierRegex, fn, options);
    return this;
  }

  addShortcut(winShortcut: string, macShortcut: string, fn: Function, scope): CodeEditorInstance {
    this.editor.getShortcuts().addShortcut(winShortcut, macShortcut, fn, scope);

    return this;
  }

  getAnnotator(): Annotator {
    return this.editor.getAnnotator();
  }

  getSelection(): Selection {
    return this.editor.getSelection();
  }

  getParams(): Params {
    return this.editor.getParams();
  }

  getLockedRange() {
    return this.editor.getLockedRange();
  }

  resize(): CodeEditorInstance {
    this.editor.resize();

    return this;
  }

  focus(): CodeEditorInstance {
    this.editor.focus();

    return this;
  }

  getValue() {
    return this.editor.getValue();
  }
}
