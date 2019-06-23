import * as Reactions from './favorites-reactions';

export const favorites = (scope, value) => Reactions.setFavorites(scope, value);
export const error = (scope, value) => Reactions.setError(scope, value);
export const view = {};

