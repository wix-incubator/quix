import {Injectable} from '@nestjs/common';
import {InjectEntityManager} from '@nestjs/typeorm';
import {DbFileTreeNode, FileTreeRepository, DbUser} from 'entities';
import {fromNullable, getOrElse, map} from 'fp-ts/lib/Option';
import {pipe} from 'fp-ts/lib/pipeable';
import {IFile, IFilePathItem} from 'shared/entities/file';
import {IFolder} from 'shared/entities/folder';
import {EntityManager} from 'typeorm';
import {
  convertListDbNodeToIFileList,
  convertSingleNodeToIFile,
  extractPath,
} from './utils';

@Injectable()
export class FoldersService {
  private fileTreeRepo: FileTreeRepository;
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {
    this.fileTreeRepo = this.entityManager.getCustomRepository(
      FileTreeRepository,
    );
  }

  /**
   * @returns {Promise<IFile[]>} list of all user folders, in the format client expects.
   */
  async getFilesForUser(user: string): Promise<IFile[]> {
    const query = await this.fileTreeRepo
      .createQueryBuilder('fileNode')
      .leftJoinAndSelect('fileNode.notebook', 'notebook')
      .leftJoinAndSelect('fileNode.folder', 'folder')
      .leftJoinAndMapOne(
        'fileNode.ownerDetails',
        DbUser,
        'user',
        'fileNode.owner = user.id',
      )
      .where({owner: user});

    const list = await query.getMany();

    return convertListDbNodeToIFileList(list);
  }

  async getFolder(rootId: string): Promise<IFolder | undefined> {
    const getFileNodeQuery = this.fileTreeRepo
      .createQueryBuilder('fileNode')
      .leftJoinAndSelect('fileNode.notebook', 'notebook')
      .leftJoinAndSelect('fileNode.folder', 'folder')
      .leftJoinAndMapOne(
        'fileNode.ownerDetails',
        DbUser,
        'user',
        'fileNode.owner = user.id',
      )
      .where('fileNode.id = :rootId', {rootId});

    const [node, children] = await Promise.all([
      /* TODO: do this in one query */
      getFileNodeQuery.getOne(),
      this.fileTreeRepo.getChildren(rootId),
    ]);

    if (node) {
      const path = await this.computePath(node);
      const nodeAsFile = convertSingleNodeToIFile(node, path);

      const files = convertListDbNodeToIFileList(children, [nodeAsFile]);
      return {...nodeAsFile, files};
    }

    return undefined;
  }

  computePath(fileNode?: DbFileTreeNode): Promise<IFilePathItem[]> {
    return pipe(
      fromNullable(fileNode),
      map(node => node.mpath.split('.').slice(0, -1)),
      map(async parentsIds => {
        if (parentsIds.length > 0) {
          const parents = await this.fileTreeRepo.getNamesByIds(parentsIds);
          return extractPath(parentsIds, parents);
        }
        return [];
      }),
      getOrElse(() => Promise.resolve([] as IFilePathItem[])),
    );
  }
}
