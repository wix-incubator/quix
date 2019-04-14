import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
import {InjectRepository, InjectEntityManager} from '@nestjs/typeorm';
import {DbNotebook, DbFileTreeNode, DbFolder} from '../../../entities';
import {Repository, EntityManager} from 'typeorm';
import {
  IFile,
  FileType,
  IFilePathItem,
} from '../../../../../shared/entities/file';
import {dbConf} from '../../../config/db-conf';

@Injectable()
export class FoldersService {
  private fileTreeRepo: Repository<DbFileTreeNode>;
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(DbFolder) private folderRepo: Repository<DbFolder>,
  ) {
    this.fileTreeRepo = this.entityManager.getRepository(DbFileTreeNode);
  }

  async getRawList(user: string, rootId?: string) {
    // if (!rootId) {
    //   const root = await this.fileTreeRepo
    //     .createQueryBuilder('node')
    //     .where('node.owner = :user', {user})
    //     .andWhere('node.parentId is NULL')
    //     .getOne();

    //   rootId = root ? root.id : undefined;
    // }

    let q = this.fileTreeRepo
      .createQueryBuilder('node')
      .where('node.owner = :user', {user});

    if (rootId) {
      const sub = this.fileTreeRepo
        .createQueryBuilder('root')
        .select('root.mpath')
        .where(`root.id = :id`)
        .getQuery();
      q = q
        .andWhere(`node.mpath LIKE ${dbConf.concat(`(${sub})`, `'%'`)}`)
        .setParameter('id', rootId);
    }

    q = q
      .leftJoinAndSelect('node.folder', 'folder')
      .leftJoinAndSelect('node.notebook', 'notebook');

    return q.getMany();
  }

  async getPathList(user: string, rootId?: string) {
    const list = await this.getRawList(user, rootId);
    if (!list) {
      return [];
    }
    const itemMap = new Map(list.map(n => [n.id, n]));
    const resultMap: Map<string, IFile> = new Map();

    const resultList = list.map(item =>
      computePath(item.id, resultMap, itemMap),
    );
    return resultList;
  }
}

function computePath(
  id: string,
  resultMap: Map<string, IFile>,
  itemMap: Map<string, DbFileTreeNode>,
) {
  const item = itemMap.get(id)!;
  const {dateCreated, dateUpdated, type, owner} = item;

  const maybeResult = resultMap.get(id);
  if (maybeResult) {
    return maybeResult;
  }

  let path: IFilePathItem[];
  if (!item.parentId) {
    path = [];
  } else {
    const parentFile = computePath(item.parentId, resultMap, itemMap);
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
