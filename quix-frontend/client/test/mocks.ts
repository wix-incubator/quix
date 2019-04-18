import UrlPattern from 'url-pattern';
import {
  IFile,
  INotebook,
  INote,
  IFolder,
  createUser,
  createNotebook,
  createNotebookWithNote,
  createFolder,
  createFile,
  createNote,
  createFolderPayload
} from '../../shared';

const mocks = {
  '/api/user': () => createUser(),
  '/api/events': () =>[200],
  // '/api/files': () => [404, {message: 'Couldn\'t fetch notebooks'}],
  '/api/files': ({id = '1'}) => [
    createMockFolder({id, name: 'My notebooks'}),
    createMockFolder({id: '2', path: [{id, name: 'My notebooks'}]}),
    createMockFile({id: '3', path: [{id, name: 'My notebooks'}]}),
    createMockFile({id: '4', path: [{id, name: 'My notebooks'}]}),
  ],
  '/api/files/404': () => [404, {message: 'Folder not found'}],
  '/api/files/:id': ({id}) => createMockFolderPayload({
    id,
    name: 'My notebooks',
    path: [{id: '1', name: 'My notebooks'}],
    files: [
      createMockFile({id: '100', path: [{id, name: 'My notebooks'}, {id: '200', name: 'New folder'}]}),
    ]
  }),
  '/api/notebook/404': () => [404, {message: 'Notebook not found'}],
  '/api/notebook/:id': ({id}) => createMockNotebookWithNote({id, path: [{id, name: 'My notebooks'}]}),
  '/api/search/:text': ({text}) => {
    const res = [createNote('1'), createNote('2'), createNote('3')];
    res.forEach(note => note.content = `select 1 as ${text}`);
    return res;
  },
  '/api/db/explore': () => [{
    name: 'catalog',
    type: 'catalog',
    children: [{
      name: 'schema',
      type: 'schema',
      children: [{
        name: 'table',
        type: 'table',
        children: []
      }]
    }]
  }, {
    name: 'catalog2',
    type: 'catalog',
    children: []
  }],
  '/api/db/explore/:schema/:catalog/:table': () => ({
    children: [{name: 'column', dataType: 'varchar'}]
  }),
  '/api/db/autocomplete': () => [],
};

let mockOverrides = {};

export const createMockFile = (props: Partial<IFile> = {}) => {
  return createFile([], {owner: 'local@quix.com', ...props});
}

export const createMockFolder = (props: Partial<IFile> = {}) => {
  return createFolder([], {owner: 'local@quix.com', ...props});
}

export const createMockFolderPayload = (props: Partial<IFolder> = {}) => {
  return createFolderPayload([], {owner: 'local@quix.com', ...props});
}

export const createMockNotebook = (props: Partial<INotebook> = {}) => {
  return createNotebook([], {owner: 'local@quix.com', ...props});
}

export const createMockNote = (notebookId: string, props: Partial<INote> = {}) => {
  return createNote(notebookId, {owner: 'local@quix.com', ...props});
}

export const createMockNotebookWithNote = (props: Partial<INotebook> = {}) => {
  return createNotebookWithNote([], {owner: 'local@quix.com', ...props});
}

export const mock = (patternOrUrl: string, patternPayload?: any) => {
  if (patternPayload) {
    mockOverrides[patternOrUrl] = () => patternPayload;
  } else {
    return Object.keys(mocks).reduce((res, key) => {
      if (!res) {
        const match = new UrlPattern(key).match(patternOrUrl);
    
        if (match) {
          let payload = (mockOverrides[key] || mocks[key])(match);

          if (payload && typeof payload[0] !== 'number') {
            payload = [200, payload];
          }

          return payload;
        }
      }
    
      return res;
    }, null) || [404, {message: 'Mock not found'}]
  }
};

export const reset = () => {
  mockOverrides = {};
};