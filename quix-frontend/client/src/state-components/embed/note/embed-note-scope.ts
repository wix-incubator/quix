import * as Reactions from './embed-note-reactions';

export const error = (scope, value) => Reactions.setError(scope, value);
export const permissions = x => x;

export const view = {
  note: (scope, value) => Reactions.setNote(scope, value),
};
