import {Instance} from './lib/app';
import {Store} from './lib/store';
import {isOwner} from './services';
import {waitForEntity} from './store';

export const Search = {
  ResultsPerPage: 20,
  MaxPages: 100,
  MaxPaginationButtons: 10,
  PaginationEdgePages: 2,
  PaginationMiddlePages: 5
};

export const QuixFolder = {
  id: 'quix',
  name: 'Quix',
  owner: 'Quix',
  ownerDetails: {
    name: 'Quix',
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

export const HeaderMenu = [{
  title: 'My notebooks',
  targetState: 'files',
  activeStates: ['files', 'notebook'],
  activeCondition: (app: Instance, store: Store, state: string, id: string) => 
    waitForEntity(store, id, state === 'files' ? 'folder' : 'notebook').then(entity => isOwner(app, entity))
}, {
  title: 'Favorites',
  targetState: 'favorites',
  activeCondition: null
}, {
  title: 'Users',
  targetState: 'users',
  activeCondition: null
}];