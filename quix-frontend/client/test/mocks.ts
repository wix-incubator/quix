import UrlPattern from 'url-pattern';
import {
  IFile,
  INotebook,
  INote,
  IFolder,
  createUser,
  createNotebook,
  createFolder,
  createFile,
  createNote,
  createFolderPayload
} from '../../shared';

const mocks = {
  '/api/user': () => createUser(),
  '/api/events': () =>[200],
  // '/api/files': () => [404, {message: 'Couldn\'t fetch notebooks'}],
  '/api/files/404': () => [404, {message: 'Folder not found'}],
  '/api/notebook/404': () => [404, {message: 'Notebook not found'}],
  '/api/files': () => createMockFiles([
    createMockFolder(),
    createMockFile(),
  ]),
  '/api/files/:id': ({id}) => createMockFolderPayload([
    createMockFile()
  ], {id}),
  '/api/notebook/:id': ({id}) => createMockNotebook([createMockNote(id)], {id}),
  '/api/search/:text': ({text}) => {
    const res = [createMockNote('1'), createMockNote('2'), createMockNote('3')];
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

export const createMockRootFolder = (props: Partial<IFile> = {}) => {
  return createFolder([], {id: '1', name: 'My notebooks', owner: 'local@quix.com', ...props});
}

export const createMockFile = (props: Partial<IFile> = {}) => {
  return createFile([{id: '1', name: 'My notebooks'}], {owner: 'local@quix.com', ...props});
}

export const createMockFolder = (props: Partial<IFile> = {}) => {
  return createFolder([{id: '1', name: 'My notebooks'}], {owner: 'local@quix.com', ...props});
}

export const createMockFiles = (children = []) => {
  return [
    createMockRootFolder(),
    ...children.map((child, index) => ({
      ...child,
      // tslint:disable-next-line: restrict-plus-operands
      id: `${index + 100}`,
    }))
  ];
}

export const createMockFolderPayload = (children = [], props: Partial<IFolder> = {}) => {
  return createFolderPayload([{id: '1', name: 'My notebooks'}], {
    owner: 'local@quix.com',
    files: children.map((child, index) => ({
      ...child,
      // tslint:disable-next-line: restrict-plus-operands
      id: `${index + 100}`
    })),
    ...props
  });
}

export const createMockNotebook = (notes = [], props: Partial<INotebook> = {}) => {
  return createNotebook([{id: '1', name: 'My notebooks'}], {
    owner: 'local@quix.com',
    notes,
    ...props
  });
}

export const createMockNote = (notebookId: string = '1', props: Partial<INote> = {}) => {
  return createNote(notebookId, {owner: 'local@quix.com', ...props});
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