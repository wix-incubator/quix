import {IItemDef, IPathItemDef} from './';
import {Item, Folder, File} from './file-explorer-models';

function getId(parent) {
  return typeof parent === 'object' ? parent.id : parent;
}

/**
 * Opens all folders on the path to file
 */
export function goToFile(fileDef: IItemDef, folder: Folder): File {
  fileDef.path.forEach(parent => {
    folder = folder.getFolderById(getId(parent)).toggleOpen(true);
  });

  return folder.getFileById(fileDef.id) || folder.getFolderById(fileDef.id);
}

export function addFolder(folder: Folder, {id, name, lazy, path, ...data}: IItemDef, options: any): Folder {
  const childFolder = folder.addFolder(id, name, data)
    .setLazy(lazy);

  if (options.expandAllFolders && !lazy) {
    childFolder.toggleOpen(true);
  }

  return childFolder;
}

export function addFile(folder: Folder, {id, name, type, path, ...data}: IItemDef): File {
  return folder.addFile(id, name, type, data);
}

/**
 * Creates a tree structure from a file definition array.
 */
export function defToTree(items: IItemDef[], options: any): Folder {
  const root = new Folder(null, null);

  const itemsMap = items.reduce((res, item: IItemDef) => {
    res[item.id] = item;
    return res;
  }, {});

  items.forEach(item => {
    let folder = root;

    (item.path || []).forEach((parent) => {
      const id = getId(parent);

      folder = folder.getFolderById(id) || addFolder(folder, itemsMap[id], options);

      if (item.type !== 'folder') {
        folder.toggleHasFileLeaf(true);
      }
    });

    if (item.type === 'folder') {
      if (!folder.getFolderById(item.id)) {
        addFolder(folder, item, options);
      }
    } else {
      addFile(folder, item);
    }
  });

  return root;
}

/**
 * Creates a file definition array from a tree.
 */
export function treeToDef(item: Item, path = [], res: IItemDef[] = []): IItemDef[] {
  if (item.getId()) {
    if (item instanceof Folder) {
      res.push({
        id: item.getId(),
        name: item.getName(),
        type: item.getType(),
        path,
        lazy: item.isLazy(),
        ...item.getData(),
      });
    } else {
      res.push({
        id: item.getId(),
        name: item.getName(),
        type: item.getType(),
        path,
        ...item.getData(),
      });
    }
  }

  if (item instanceof Folder) {
    path = !item.getId() ? path : [
      ...path,
      ...[{
        id: item.getId(),
        name: item.getName()
      }]
    ];

    (item as Folder).getFolders().forEach(folder => {
      treeToDef(folder, path, res);
    });

    (item as Folder).getFiles().forEach(file => treeToDef(file, path, res));
  }

  return res;
}

/**
 * Creates a file definition object from file
 */
export function itemToDef(item: Item): IItemDef {
  const path: IPathItemDef[] = [];
  let folder: Folder = item.getParent();

  while (folder && folder.getParent()) {
    path.unshift({
      id: folder.getId(),
      name: folder.getName()
    });

    folder = folder.getParent();
  }

  return {
    id: item.getId(),
    name: item.getName(),
    type: item.getType(),
    path,
    ...item.getData()
  };
}