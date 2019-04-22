import {
  FileType,
  IFile,
  IFilePathItem,
} from '../../../../../shared/entities/file';
import {DbFileTreeNode} from '../../../entities';

/**
 * @param list The list dbNodes you want to convert to a IFile
 * @param initialData if you have a praent node already converted to an IFile, this is where you pass it
 */
export function convertListDbNodeToIFileList(
  list: DbFileTreeNode[],
  initialData: IFile[] = [],
): IFile[] {
  const itemMap = new Map(list.map(child => [child.id, child]));
  const resultMap = new Map(initialData.map(file => [file.id, file]));
  return list.map(item => convertToIFile(item.id, itemMap, resultMap));
}

/**
 * given a mapping of DbFileTreeNode items, and a resultCache - return an IFile
 */
function convertToIFile(
  id: string,
  itemMap: Map<string, DbFileTreeNode>,
  resultMap: Map<string, IFile>,
) {
  const alreadyConverted = resultMap.get(id);
  if (alreadyConverted) {
    return alreadyConverted;
  }

  const item = itemMap.get(id)!;
  const {dateCreated, dateUpdated, type, owner} = item;

  let path: IFilePathItem[];
  if (!item.parentId) {
    path = [];
  } else {
    const parentFile = convertToIFile(item.parentId, itemMap, resultMap);
    path = parentFile.path.concat([{id: parentFile.id, name: parentFile.name}]);
  }

  const name =
    item.type === FileType.folder ? item.folder!.name : item.notebook!.name;

  const result: IFile = {
    id: item.type === FileType.folder ? id : item.notebookId!,
    dateCreated,
    dateUpdated,
    type,
    name,
    owner,
    isLiked: false,
    path,
  };

  resultMap.set(id, result);
  return result;
}

export function extractPath(
  parentsIds: string[],
  parents: DbFileTreeNode[],
): IFilePathItem[] {
  try {
    return parentsIds.map(id => {
      const item = parents.find(p => p.id === id)!;
      const name = computeName(item);
      return {name, id};
    });
  } catch (e) {
    throw new Error('Error in calculation path for notebook');
  }
}

export function dbNodeToFileItem(node: DbFileTreeNode): IFilePathItem {
  const name = computeName(node);
  return {id: node.id, name};
}

export function computeName(node: DbFileTreeNode): string {
  const name =
    node.type === FileType.folder
      ? node.folder && node.folder.name
      : node.notebook && node.notebook.name;
  return name || '';
}

export function convertSignleNodeToIFile(
  node: DbFileTreeNode,
  path: IFilePathItem[],
) {
  const {id, dateCreated, dateUpdated, owner, type} = node;
  const name = computeName(node);

  const nodeAsFile: IFile = {
    id,
    name,
    path,
    dateCreated,
    dateUpdated,
    owner,
    type,
    isLiked: false,
  };
  return nodeAsFile;
}
