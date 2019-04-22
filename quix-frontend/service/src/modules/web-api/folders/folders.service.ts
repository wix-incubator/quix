import {Injectable} from '@nestjs/common';
import {InjectEntityManager, InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {dbConf} from '../../../config/db-conf';
import {DbFileTreeNode, DbFolder, FileTreeRepository} from '../../../entities';
import {
  extractPath,
  dbNodeToFileItem,
  computeName,
  convertSignleNodeToIFile,
  convertListDbNodeToIFileList,
} from './utils';
import {IFile} from '../../../../../shared/entities/file';
import {IFolder} from '../../../../../shared/entities/folder';

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
    const list = await this.fileTreeRepo.find({
      where: {owner: user},
      relations: ['notebook', 'folder'],
    });

    return convertListDbNodeToIFileList(list);
  }

  async getFolder(rootId: string): Promise<IFolder | undefined> {
    const [node, children] = await Promise.all([
      /* TODO: do this in one query */
      this.fileTreeRepo.findOne(rootId, {relations: ['folder', 'notebook']}),
      this.fileTreeRepo.getChildren(rootId),
    ]);
    if (node) {
      const path = await this.computePath(node);
      const nodeAsFile = convertSignleNodeToIFile(node, path);

      const files = convertListDbNodeToIFileList(children, [nodeAsFile]);
      return {...nodeAsFile, files};
    }
    return undefined;
  }

  async computePath(fileNode: DbFileTreeNode) {
    const mpath = fileNode.mpath;
    const parentsIds = mpath.split('.').slice(0, -1); // remove own Id

    if (parentsIds.length > 0) {
      const parents = await this.fileTreeRepo.getNamesByIds(parentsIds);
      return extractPath(parentsIds, parents);
    }
    return [];
  }
}
