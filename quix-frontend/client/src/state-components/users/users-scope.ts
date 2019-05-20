import * as Reactions from './users-reactions';

export const users = (scope, value) => Reactions.setUsers(scope, value);
export const error = (scope, value) => Reactions.setError(scope, value);
export const view = {};

