import {inject} from '../../lib/core';
import {Store} from '../../lib/store';
import {INote} from '@wix/quix-shared';
import {IScope} from './note-types';
import {App} from '../../lib/app';

export const onFoldToggle = (scope: IScope, store: Store) => () => {
  scope.options.focusEditor = true;
};

export const onMarkToggle = (scope: IScope, store: Store) => () => {
  scope.onMarkToggle({note: scope.note});
};

export const onNameChange = (scope: IScope, store: Store) => () => {
  scope.onNameChange({note: scope.note});
};

export const onContentChange = (scope: IScope, store: Store) => () => {
  scope.onContentChange({note: scope.note});
};

export const onShare = (scope: IScope, store: Store) => (note: INote) => {
  scope.onShare({note});
};

export const onClone = (scope: IScope, store: Store) => (note: INote) => {
  scope.onClone({note});
};

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

  inject('$timeout')(() => scope.vm.editor.focus());
};

export const onEditorInstanceLoad = (scope: IScope, store: Store, app: App) => (editor) => {
  scope.vm.editor = editor;
};

export const onRunnerInstanceLoad = (scope: IScope, store: Store, app: App) => (runner) => {
  scope.vm.runner = runner;
};

export const onRunnerCreated = (scope: IScope, store: Store) => (runner) => {
  scope.onRunnerCreated({runner});
};

export const onRunnerDestroyed = (scope: IScope, store: Store) => (runner) => {
  scope.onRunnerDestroyed({runner});
};
