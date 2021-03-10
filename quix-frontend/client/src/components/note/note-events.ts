import {inject, utils} from '../../lib/core';
import {Store} from '../../lib/store';
import {INote} from '@wix/quix-shared';
import {IScope} from './note-types';
import {App} from '../../lib/app';
import { cloneDeep, isEqual } from 'lodash';
import { RunnerComponentInstance } from '../../lib/runner/directives/runner/runner';

export const onFoldToggle = (scope: IScope, store: Store) => () => {
  scope.options.focusEditor = true;
};

export const onMarkToggle = (scope: IScope, store: Store) => () => {
  scope.onMarkToggle({note: scope.note});
};

export const onNameChange = (scope: IScope, store: Store) => () => {
  scope.onNameChange({note: scope.note});
};

export const onContentChange = (scope: IScope, store: Store) => (textContent: string, richContent: Record<string, any>) => {
  scope.note.content = textContent;
  scope.note.richContent = richContent;

  scope.onContentChange({note: scope.note});
};

export const onShare = (scope: IScope, store: Store) => (note: INote, params: string) => {
  scope.onShare({note, params});
};

export const onClone = (scope: IScope, store: Store) => (note: INote) => {
  scope.onClone({note});
};

export const onCustomAction = (scope: IScope, store: Store) => (action: any) => {
  utils.scope.safeApply(scope, () => {
    const {content, richContent} = action.handler(cloneDeep(scope.note));

    if (scope.note.content !== content || !isEqual(scope.note.richContent, richContent)) {
      scope.events.onContentChange(content, richContent);
    }
  });
}

export const onDelete = (scope: IScope, store: Store) => (note: INote) => {
  scope.onDelete({note});
};

export const onSave = (scope: IScope, store: Store) => () => {
  scope.onSave();
};

export const onRun = (scope: IScope, store: Store) => () => {
  scope.onRun();
};

export const onMaximizeToggle = (scope: IScope, store: Store, app: App) => () => {
  scope.vm.isFolded = false;

  inject('$timeout')(() => scope.vm.editor?.focus());
};

export const onEditorInstanceLoad = (scope: IScope, store: Store, app: App) => (editor) => {
  scope.vm.editor = editor;
};

export const onRunnerInstanceLoad = (scope: IScope, store: Store, app: App) => (runner: RunnerComponentInstance) => {
  scope.vm.runner = runner;

  runner.setUser(app.getUser());
};

export const onRunnerCreated = (scope: IScope, store: Store) => (runner) => {
  scope.onRunnerCreated({runner});
};

export const onRunnerDestroyed = (scope: IScope, store: Store) => (runner) => {
  scope.onRunnerDestroyed({runner});
};
