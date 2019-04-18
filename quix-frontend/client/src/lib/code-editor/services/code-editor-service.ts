import {flatten, last} from 'lodash';
import ace from 'brace';
import {srv, inject} from '../../core';
import {default as Completer} from './code-editor-completer';
import {default as Annotator} from './code-editor-annotator';
import {default as Selection} from './code-editor-selection';
import {default as Shortcuts} from './code-editor-shortcuts';
import {default as Params} from './code-editor-params';

declare const ResizeObserver;

export interface AceEditorOptions {
  mode?: string;
  theme?: string;
  enableMultiselect?: boolean;
  showGutter?: boolean;
  highlightActiveLine?: boolean;
  focus?: boolean;
}

export interface CodeEditorOptions {
  ace?: AceEditorOptions;
  focus?: boolean;
  fitContent?: boolean;
}

const aceDefaults = {
  mode: 'ace/mode/presto',
  theme: 'ace/theme/tomorrow',
  enableMultiselect: false,
  highlightActiveLine: true,
  showGutter: true
};
function getHeight(_ace) {
  // tslint:disable-next-line: restrict-plus-operands
  return _ace.getSession().getScreenLength() * _ace.renderer.lineHeight + _ace.renderer.scrollBar.getWidth();
}

function setHeight(_ace, element) {
  // tslint:disable-next-line: restrict-plus-operands
  element.css('height', Math.min(getHeight(_ace), 400) + 'px');
}

export default class CodeEditor extends srv.eventEmitter.EventEmitter {
  private readonly ace;
  private valid: boolean = null;
  private locked: [number, number][] = null;

  private readonly completer: Completer = null;
  private readonly annotator: Annotator = null;
  private readonly selection: Selection = null;
  private readonly shortcuts: Shortcuts = null;
  private readonly params: Params = null;

  constructor(scope, private readonly element, text, options?: CodeEditorOptions) {
    super();

    this.ace = ace.edit(element.text(text).get(0));

    this.completer = new Completer(this.ace);
    this.annotator = new Annotator(this.ace);
    this.selection = new Selection(this.ace, scope);
    this.shortcuts = new Shortcuts(this.ace);
    this.params = new Params(this, this.ace, scope.options, scope);

    this.init(options);
  }

  private init(options: CodeEditorOptions = {}): CodeEditor {
    this.ace.setOptions({...aceDefaults, ...options.ace});

    this.ace.$blockScrolling = Infinity;
    this.ace.session.setFoldStyle('markbeginend');

    this.ace.getSession().on('change', ({start, lines}) => {
      this.setValid(null);

      this.fire('change', this.ace.getValue(), {
        isInLockRange: this.locked && start.row < last(flatten(this.locked)),
        isMultilineInsert: lines.length > 1
      });
    });

    const lockExceptions = ['golinedown', 'golineup', 'gotoright', 'gotoleft'];
    this.ace.commands.on('exec', e => {
      const range = this.getSelection().getRange();

      if (!this.locked || (range && ['paste', 'del', 'backspace'].indexOf(e.command.name) !== -1 && range.start.row === 0 && range.end.row >= 1)) {
        return;
      }

      const {row, column} = this.ace.selection.getCursor();
      const lock = this.locked.some(([start, end]) => {
        return (row >= start && row <= end && lockExceptions.indexOf(e.command.name) === -1)
          || (e.command.name === 'backspace' && row === end + 1 && column === 0);
      });

      if (lock) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    if (options.focus) {
      this.ace.focus();
    }

    if (options.fitContent) {
      setHeight(this.ace, this.element);
      this.ace.getSession().on('change', () => {
        setHeight(this.ace, this.element);
        this.resize();
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      // listen to element resize natively
      new ResizeObserver(() => this.resize()).observe(this.element.get(0));
    } else {
      // resize the editor corectly inside a hidden container
      inject('$timeout')(() => this.resize());
    }

    return this;
  }

  isValid(): boolean {
    return this.valid;
  }

  getCompleter(): Completer {
    return this.completer;
  }

  getAnnotator(): Annotator {
    return this.annotator;
  }

  getSelection(): Selection {
    return this.selection;
  }

  getShortcuts(): Shortcuts {
    return this.shortcuts;
  }

  getParams(): Params {
    return this.params;
  }

  getValue(): string {
    return this.ace.getValue();
  }

  getLockedRange(): [number, number][] {
    return this.locked;
  }

  setReadonly(readonly: boolean): CodeEditor {
    this.ace.setReadOnly(readonly);
    this.ace.setOption('highlightActiveLine', !readonly);
    this.ace.setOption('highlightGutterLine', !readonly);

    return this;
  }

  setValid(valid: boolean): CodeEditor {
    this.valid = valid;

    this.fire('validToggle', valid);

    return this;
  }

  setValue(value): CodeEditor {
    this.ace.setValue(value, -1);
    this.getSelection().clearSelection();

    return this;
  }

  lockLines(range: [number, number][]): CodeEditor {
    this.locked = range;

    return this;
  }

  unlockLines(): CodeEditor {
    this.locked = null;

    return this;
  }

  resize(): CodeEditor {
    this.ace.resize();
    this.fire('resize', this.element.width());

    return this;
  }

  focus(): CodeEditor {
    this.ace.focus();

    return this;
  }

  destroy(): CodeEditor {
    this.ace.session.setUseWorker(false);
    this.ace.destroy();

    return this;
  }
}
