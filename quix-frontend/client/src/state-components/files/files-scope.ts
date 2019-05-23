import * as Reactions from './files-reactions';

export const folder = (scope, value) => Reactions.setFolder(scope, value);
export const files = (scope, value) => Reactions.setFiles(scope, value);
export const error = (scope, value) => Reactions.setError(scope, value);
export const permissions = x => x;
export const isRoot = x => x;

export const view = {
  fileError: (scope, value) => Reactions.setError(scope, value),
  markedMap: (scope, value) => Reactions.setMarkedMap(scope, value),
  markedList: (scope, value) => Reactions.setMarkedList(scope, value),
};

