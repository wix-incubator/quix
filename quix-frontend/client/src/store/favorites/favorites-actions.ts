import {IFile} from '../../../../shared';

export const setFavorites = (favorites: IFile[]) => ({
  type: 'favorites.set',
  favorites
});

export const setError = (error: any) => ({
  type: 'favorites.setError',
  error
});
