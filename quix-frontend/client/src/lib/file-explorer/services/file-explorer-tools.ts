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

  return folder.getFileById(fileDef.id);
}

/**
 * Creates a tree structure from a file definition array.
 */
export function defToTree(items: IItemDef[]): Folder {
  const root = new Folder(null, null);
  const folderNameMap = items.reduce((res, item: IItemDef) => {
    if (item.type === 'folder') {
      res[item.id] = item.name;
    }
    return res;
  }, {});

  items.forEach(item => {
    let folder = root;

    (item.path || []).forEach((parent) => {
      const id = getId(parent);

      folder = folder.getFolderById(id) || folder.addFolder(id, folderNameMap[id]);

      if (item.type !== 'folder') {
        folder.toggleHasFileLeaf(true);
      }
    });

    if (item.type === 'folder') {
      if (!folder.getFolderById(item.id)) {
        folder.addFolder(item.id, folderNameMap[item.id]);
      }
    } else {
      folder.addFile(item.id, item.name, item.type, item.dateCreated, item.dateUpdated);
    }
  });

  return root;
}

/**
 * Creates a file definition array from a tree.
 */
export function treeToDef(item: Item, path = [], res: IItemDef[] = []): IItemDef[] {
  if (item instanceof File || (item as Folder).isEmpty()) {
    res.push({
      id: item.getId(),
      name: item.getName(),
      type: item.getType(),
      path,
      dateCreated: item.getDateCreated(),
      dateUpdated: item.getDateUpdated()
    });
  } else {
    (item as Folder).getFolders().forEach(folder => {
      treeToDef(folder, path.concat([{
        id: folder.getId(),
        name: folder.getName()
      }]), res);
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

  while (folder.getParent()) {
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
    dateCreated: item.getDateCreated(),
    dateUpdated: item.getDateUpdated()
  };
}