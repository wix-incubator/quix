import {Store} from '../lib/store';
import {default as app} from './app/app-branch';
import {default as notebook} from './notebook/notebook-branch';
import {default as notebookCache} from './notebook/notebook-cache';
import {default as files} from './files/files-branch';
import {default as foldersCache} from './files/files-cache';
import {default as db} from './db/db-branch';
import {default as dbCache} from './db/db-cache';
import {default as folder} from './folder/folder-branch';
import {default as folderCache} from './folder/folder-cache';
import {default as users} from './users/users-branch';
import {default as usersCache} from './users/users-cache';
import {default as favorites} from './favorites/favorites-branch';
import {default as favoritesCache} from './favorites/favorites-cache';
import {IEntity} from '@wix/quix-shared';

export const branches = {
  app,
  users,
  notebook,
  files,
  db,
  folder,
  favorites,
};

export let cache = null;
export const initCache = (store: Store) => {
  cache = {
    users: usersCache(store),
    notebook: notebookCache(store),
    files: foldersCache(store),
    db: dbCache(store),
    folder: folderCache(store),
    favorites: favoritesCache(store),
  };
};

export const waitForEntity = (scope, store: Store, id: string, entity: string) => new Promise<IEntity>((resolve, reject) => {
  const unsubscribe = store.subscribe(`${entity}`, state => {
    if ((state[entity] && (!id || state[entity].id === id)) || state.error) {
      if (unsubscribe) {
        unsubscribe();
      }

      return state[entity] ? resolve(state[entity]) : reject(state.error);
    }
  }, scope);
});