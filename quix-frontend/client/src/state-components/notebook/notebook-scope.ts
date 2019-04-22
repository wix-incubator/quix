import * as Reactions from './notebook-reactions';
import {Instance} from '../../lib/app';
import { Store } from '../../lib/store';

export const notebook = (scope, value, store: Store, app: Instance) => Reactions.setNotebook(scope, app, value);
export const notes = (scope, value) => Reactions.setNotes(scope, value);
export const error = (scope, value) => Reactions.setError(scope, value);
export const runners = x => x;
export const permissions = x => x;

export const queue = {
  size: (scope, value) => Reactions.setHasChanges(scope, value > 0)
};

export const view = {
  markedMap: (scope, value) => Reactions.setMarkedMap(scope, value),
  markedList: (scope, value) => Reactions.setMarkedList(scope, value),
  note: (scope, value) => Reactions.setNote(scope, value),
};
