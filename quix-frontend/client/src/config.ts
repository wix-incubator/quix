import {Instance} from './lib/app';
import {Store} from './lib/store';
import {isOwner} from './services';
import {waitForEntity} from './store';

export const QuixFolder = {
  id: 'quix',
  name: 'Quix',
  owner: 'Quix'
};

export const ExamplesNotebook = {
  id: 'examples',
  name: 'Examples',
  owner: 'Quix'
};

export const HeaderMenu = [{
  title: 'My notebooks',
  targetState: 'files',
  activeStates: ['files', 'notebook'],
  condition: (app: Instance, store: Store, state: string) => 
    waitForEntity(store, state === 'files' ? 'folder' : 'notebook').then(entity => isOwner(app, entity))
}, {
  title: 'Users',
  targetState: 'users',
  condition: null
}];