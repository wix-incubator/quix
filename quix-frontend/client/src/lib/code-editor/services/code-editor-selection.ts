import {throttle} from 'lodash';
import {srv, utils} from '../../core';

export default class CodeEditorSelection extends srv.eventEmitter.EventEmitter {
  private range;

  constructor (private readonly ace, scope) {
    super();

    const self = this;
    const selectionEvents = {
      onSelection: throttle(text => utils.scope.safeApply(scope, () => self.fire('select', text)), 200),
      onDeselection: () => utils.scope.safeApply(scope, () => self.fire('deselect'))
    };

    ace.getSession().getSelection().on('changeSelection', (e, selection) => {
      const range = selection.getRange();
      const selectedText = ace.getSession().getDocument().getTextRange(selection.getRange()).trim();

      if (selectedText && selectedText.split(/\s|\n/, 2).length >= 2) {
        selectionEvents.onSelection(selectedText);
        this.range = range;
      } else {
        selectionEvents.onDeselection();
        this.range = null;
      }
    });
  }

  getRange() {
    return this.range;
  }

  clearSelection() {
    this.ace.getSelection().clearSelection();
    this.fire('deselect');
  }

  getOffset() {
    return (this.range && this.range.start.row) || 0;
  }
}
