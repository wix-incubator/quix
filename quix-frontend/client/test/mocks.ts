import UrlPattern from 'url-pattern';
import {IFile, INotebook, createUser, createNotebook, createNotebookWithNote, createFolder, createFile, createNote, INote} from '../../shared';

const mocks = {
  '/api/user': () => createUser(),
  '/api/events': () => ({status: 200}),
  '/api/files': () => [
    createMockFolder(),
    createMockFile(),
    createMockFile(),
  ],
  '/api/notebook/:id': ({id}) => createMockNotebookWithNote({id}),
  '/api/search/:text': ({text}) => {
    const res = [createNote('1'), createNote('2'), createNote('3')];
    res.forEach(note => note.content = `select 1 as ${text}`);
    return res;
  },
  '/api/db/explore': () => [{
    name: 'catalog',
    children: [{
      name: 'schema',
      children: [{
        name: 'table',
        children: []
      }]
    }]
  }],
  '/api/db/explore/:schema/:catalog/:table': () => [{name: 'column', dataType: 'varchar'}],
  '/api/db/autocomplete': () => [],
};

let mockOverrides = {};

export const createMockFile = (props: Partial<IFile> = {}) => {
  return createFile([], {owner: 'local@quix.com', ...props});
}

export const createMockFolder = (props: Partial<IFile> = {}) => {
  return createFolder([], {owner: 'local@quix.com', ...props});
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