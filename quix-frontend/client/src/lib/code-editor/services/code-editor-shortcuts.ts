import {utils} from '../../core';

export default class CodeEditorShortcuts {
  constructor (private readonly ace) {

  }

  addShortcut(winShortcut: string, macShortcut: string, fn, scope) {
    this.ace.commands.addCommand({
      name: macShortcut,
      bindKey: {win: winShortcut, mac: macShortcut},
      exec: () => utils.scope.safeApply(scope, fn)
    });
  }
}
