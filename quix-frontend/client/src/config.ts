import { App } from './lib/app';
import { Store } from './lib/store';
import { isOwner } from './services';
import { waitForEntity } from './store';

export const Time = {
  Format: 'YYYY-MM-DD HH:mm'
};

export const DB = {
  SampleLimit: 1000,
  RootName: '__root'
};

export const Search = {
  ResultsPerPage: 20,
  MaxPages: 100,
  MaxPaginationButtons: 10,
  PaginationEdgePages: 2,
  PaginationMiddlePages: 5
};

export const Import = {
  FolderName: '__imports__'
};

export const QuixFolder = {
  id: 'quix',
  name: 'Quix',
  owner: 'Quix',
  ownerDetails: {
    name: 'Quix'
  } as any
};

export const ExamplesNotebook = {
  id: 'examples',
  name: 'Examples',
  owner: 'Quix',
  ownerDetails: {
    name: 'Quix',
    avatar: 'http://quix.wix.com/assets/logo.png'
  } as any
};

export const HeaderMenu = scope => [
  {
    title: 'My notebooks',
    targetState: 'files',
    activeStates: ['files', 'notebook'],
    activeCondition: (app: App, store: Store, state: string, id: string) =>
      waitForEntity(
        scope,
        store,
        id,
        state === 'files' ? 'folder' : 'notebook'
      ).then(entity => isOwner(app, entity))
  },
  {
    title: 'Favorites',
    targetState: 'favorites',
    activeCondition: null
  },
  {
    title: 'Users',
    targetState: 'users',
    activeCondition: null
  },
  {
    title: 'History',
    targetState: 'history',
    activeCondition: null
  }
];
