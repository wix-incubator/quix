import {Store} from '../../lib/store';
import {IScope} from './note-types';
import {confirm} from '../../services';
import {Instance} from '../../lib/app';

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

export const onDelete = (scope: IScope, store: Store) => () => {
  confirm('delete', 'note').then(() =>  scope.onDelete({note: scope.note}));
};

export const onSave = (scope: IScope, store: Store) => () => {
  scope.onSave();
};

export const onRun = (scope: IScope, store: Store) => () => {
  scope.onRun();
};

export const onRunnerInstanceLoad = (scope: IScope, store: Store, app: Instance) => (instance) => {
  instance.setBaseUrl(app.getConfig().quixBackendUrl);
};

export const onRunnerCreated = (scope: IScope, store: Store) => (runner) => {
  scope.onRunnerCreated({runner});
};

export const onRunnerDestroyed = (scope: IScope, store: Store) => (runner) => {
  scope.onRunnerDestroyed({runner});
};
