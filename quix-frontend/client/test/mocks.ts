import UrlPattern from "url-pattern";
import {
  IUser,
  IHistory,
  IFile,
  INotebook,
  INote,
  IFolder,
  createUser,
  createHistory,
  createNotebook,
  createFolder,
  createFile,
  createNote,
  createFolderPayload
} from "@wix/quix-shared";
import * as moment from "moment";
import {ServerTreeItem} from '../src/components/db-sidebar/db-sidebar-types';
import {v4 as uuidv4} from 'uuid';

const mocks = {
  "/api/user": () => createUser(),
  "/api/events": () => [200],
  "/api/users": () => 
    [...Array(200).keys()].map(key =>
      createMockUser({
        id: uuidv4(),
        email: "valery" + key + "@wix.com",
        avatar: "http://quix.wix.com/assets/user.svg",
        name: "Valery Frolov" + key,
        rootFolder: "6c98fe9a-39f7-4674-b003-70f9061bbee5",
        dateCreated: Date.now(),
        dateUpdated: Date.now()
      })
    ),
  "/api/history": () => {
    return [...Array(101).keys()].map(key =>
      createMockHistory({
        id: "" + key,
        email: "valery" + key + "@wix.com",
        query: ["SELECT 1", "SELECT 2"],
        moduleType: key % 2 ? "presto" : "athena",
        startedAt: moment.utc().format()
      })
    );
  },
  // '/api/files': () => [404, {message: 'Couldn\'t fetch notebooks'}],
  // '/api/files': () => [500, {message: 'Failed to fetch files'}],
  "/api/files": () => createMockFiles(),
  // '/api/files': () => createMockFiles([createMockFolder({id: '10'}), createMockFile({id: '11'})]),
  "/api/files/404": () => [404, { message: "Folder not found" }],
  "/api/files/500": () => [500, { message: "Couldn't fetch folder" }],
  "/api/files/:id": ({ id }) =>
    createMockFolderPayload(
      [createMockFolder({ id: "100" }), createMockFile({ id: "101" })],
      {
        id,
        ownerDetails: {
          avatar: "http://quix.wix.com/assets/user.svg"
        } as any
      }
    ),
  "/api/notebook/404": () => [404, { message: "Notebook not found" }],
  "/api/notebook/500": () => [500, { message: "Couldn't fetch notebook" }],
  "/api/notebook/:id": ({ id }) =>
    createMockNotebook(
      [
        createMockNote(id, {
          id: "1001",
          name: "Runnable",
          content: "do success"
        }),
        createMockNote(id, {
          id: "1002",
          name: "Runnable",
          content: "do success",
          type: "python"
        }),
        createMockNote(id, {
          id: "1003",
          name: "Runnable (timeout)",
          content: "do success timeout=200"
        }),
        createMockNote(id, {
          id: "1004",
          name: "Runnable (error)",
          content: "do error"
        }),
        createMockNote(id, {
          id: "1005",
          name: "Runnable (permission error)",
          content: "do permission error"
        }),
        createMockNote(id, { id: "1006", content: 'select 1'}),
        createMockNote(id, { id: "1007" }),
        createMockNote(id, { id: "1008" }),
      ],
      {
        id,
        ownerDetails: {
          avatar: "http://quix.wix.com/assets/user.svg"
        } as any
      }
    ),
  "/api/favorites": () => [
    createMockFile({
      id: "100",
      isLiked: true,
      ownerDetails: {
        id: "valery@wix.com",
        email: "valery@wix.com",
        avatar: "http://quix.wix.com/assets/user.svg",
        name: "Valery Frolov",
        rootFolder: "6c98fe9a-39f7-4674-b003-70f9061bbee5",
        dateCreated: Date.now(),
        dateUpdated: Date.now()
      }
    }),
    createMockFile({
      id: "101",
      isLiked: true,
      ownerDetails: {
        id: "anton@wix.com",
        email: "anton@wix.com",
        avatar: "http://quix.wix.com/assets/user.svg",
        name: "Anton Podolsky",
        rootFolder: "de6908dd-7f1e-4803-ab0d-5f9d6a496609",
        dateCreated: Date.now(),
        dateUpdated: Date.now()
      }
    })
  ],
  "/api/search/none": () => ({ count: 0, notes: [] }),
  "/api/search/500": () => [500, { message: "Search error" }],
  "/api/search/:text": ({ text }) => {
    const res = [createMockNote("1"), createMockNote("2"), createMockNote("3")];
    res.forEach(
      note =>
        (note.content = `SELECT
    date_trunc('year', shipdate) as ${text}
    , shipmode
    , sum(quantity) quantity
FROM $schema.lineitem
GROUP BY 1, 2
ORDER BY 1
`)
    );

    // return {notes: [], count: 0};
    return { notes: res, count: 365 };
  },
  // '/api/db/presto/explore': () => [500, {message: 'Failed to fetch DB tree'}],
  // '/api/db/presto/explore': () => [],
  "/api/db/:type/explore": ({ type }) => {
    if (type === "presto") {
      const response = [];
      for (let i = 0; i < 50; i++) {
        response.push({
          name: 'catalog' + i,
          type: 'catalog',
          children: [
            {
              name: 'schema' + i,
              type: 'schema',
              children: [
                {
                  name: 'table' + i,
                  type: 'table',
                  children: []
                }
              ]
            }
          ]
        })
      }
      return response;
    }

    return [
      {
        name: "__root",
        type: "catalog",
        children: [
          {
            name: "schema",
            type: "schema",
            children: [
              {
                name: "table_with_a_very_looooooooooooooooong_name",
                type: "table",
                children: []
              }
            ]
          },
          {
            name: "schema2",
            type: "schema",
            children: []
          }
        ]
      }
    ];
  },
  "/api/db/:type/explore/:catalog/:schema/:table": ({ table }) => ({
    children: [{ name: `column_of_${table}`, dataType: "varchar" }]
  }),
  "/api/db/:type/autocomplete": () => ({
    catalogs: ["catalog", "catalog2"],
    schemas: ["schema"],
    tables: ["table"],
    columns: ["column"]
  }),
  // '/api/db/:type/search': () => [],
  "/api/db/:type/search": () => {
    const response = [];
      for (let i = 0; i < 10; i++) {
        response.push({
          name: 'catalog' + i,
          type: 'catalog',
          children: [
            {
              name: 'schema' + i,
              type: 'schema',
              children: [
                {
                  name: 'table' + i,
                  type: 'table',
                  children: []
                }
              ]
            }
          ]
        })
      }
      return response;
  }
  
};

let mockOverrides = {};

export const createMockUser = (props: Partial<IUser> = {}) => {
  return createUser(props);
};

export const createMockHistory = (props: Partial<IHistory> = {}) => {
  return createHistory(props);
};

export const createMockRootFolder = (props: Partial<IFile> = {}) => {
  return createFolder([], {
    id: "1",
    name: "My notebooks",
    owner: "local@quix.com",
    ownerDetails: {
      avatar: "http://quix.wix.com/assets/user.svg"
    } as any,
    ...props
  });
};

export const createMockFile = (props: Partial<IFile> = {}) => {
  return createFile([{ id: "1", name: "My notebooks" }], {
    owner: "local@quix.com",
    ...props
  });
};

export const createMockFolder = (props: Partial<IFile> = {}) => {
  return createFolder([{ id: "1", name: "My notebooks" }], {
    owner: "local@quix.com",
    ...props
  });
};

export const createMockFiles = (children = []) => {
  return [
    createMockRootFolder(),
    ...children.map(child => ({
      ...child
    }))
  ];
};

export const createMockFolderPayload = (
  children = [],
  props: Partial<IFolder> = {}
) => {
  return createFolderPayload([{ id: "1", name: "My notebooks" }], {
    owner: "local@quix.com",
    files: children.map((child, index) => ({
      ...child,
      // tslint:disable-next-line: restrict-plus-operands
      id: `${index + 100}`
    })),
    ...props
  });
};

export const createMockNotebook = (
  notes = [],
  props: Partial<INotebook> = {}
) => {
  return createNotebook([{ id: "1", name: "My notebooks" }], {
    owner: "local@quix.com",
    notes,
    ...props
  });
};

export const createMockNote = (
  notebookId: string = "1",
  props: Partial<INote> = {}
) => {
  return createNote(notebookId, { owner: "local@quix.com", ...props });
};

export const createMockDbExplorer = (
  items: ServerTreeItem[] = [],
): ServerTreeItem[] => {
  return items.length > 0 ? items : [createMockDbExplorerItem()];
};

export const createMockDbExplorerItem = (
  props: Partial<ServerTreeItem> = {},
): ServerTreeItem => {
  return {
    name: props.name || 'treeItem',
    type: props.type || 'catalog',
    children: props.children || [],
  };
};

export const mock = async (patternOrUrl: string, patternPayload?: any, options?: {}) => {
  if (patternPayload) {
    mockOverrides[patternOrUrl] = {options, getPayload: () => patternPayload};
  } else {
    const [status, payload, delay] = Object.keys(mocks).reduce((res, key) => {
        if (!res) {
          const match = new UrlPattern(key).match(patternOrUrl);

          if (match) {
            let payloadResult = (mockOverrides[key]?.getPayload || mocks[key])(match);

            if (payloadResult && typeof payloadResult[0] !== "number") {
              payloadResult = [200, payloadResult];
            }

            return [...payloadResult, mockOverrides[key]?.options?.delay];
          }
        }

        return res;
      }, null) || [404, { message: "Mock not found" }]
    
    if (delay) {
      await new Promise(res => setTimeout(res, delay));
    }
    return [status, payload];
  }
};

export const reset = () => {
  mockOverrides = {};
};
