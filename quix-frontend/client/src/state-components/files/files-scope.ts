import * as Reactions from './files-reactions';

export const file = (scope, value) => Reactions.setFile(scope, value);
export const files = (scope, value) => Reactions.setFiles(scope, value);
export const permissions = x => x;

export const view = {
  markedMap: (scope, value) => Reactions.setMarkedMap(scope, value),
  markedList: (scope, value) => Reactions.setMarkedList(scope, value),
};

