import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {FileType, IFilePathItem} from '../../../../../shared/entities/file';
import {INotebook} from '../../../../../shared/entities/notebook';
import {
  DbFileTreeNode,
  DbNotebook,
  FileTreeRepository,
} from '../../../entities';

@Injectable()
export class NotebookService {
  constructor(
    @InjectRepository(DbNotebook) private notebookRepo: Repository<DbNotebook>,
    private fileTreeRepo: FileTreeRepository,
  ) {}

  async getId(getId: string): Promise<INotebook | undefined> {
    const notebook = await this.notebookRepo.findOne(getId, {
      relations: ['notes', 'fileNode'],
    });

    if (!notebook) {
      return undefined;
    }
    const path = (await this.computePath(notebook)) || [];
    const {
      id,
      notes,
      dateCreated,
      dateUpdated,
      isLiked,
      name,
      owner,
    } = notebook;
    return {id, notes, dateCreated, dateUpdated, isLiked, name, owner, path};
  }

  private async computePath(notebook: DbNotebook) {
    const mpath = notebook.fileNode.mpath;
    const parentsIds = mpath.split('.').slice(0, -1); // remove own Id
    if (parentsIds.length > 0) {
      const parents = await this.fileTreeRepo.getNamesByIds(parentsIds);
      return extractPath(parentsIds, parents);
    }
  }
}

function extractPath(
  parentsIds: string[],
  parents: DbFileTreeNode[],
): IFilePathItem[] {
  try {
    return parentsIds.map(id => {
      const item = parents.find(p => p.id === id)!;
      const name =
        item.type === FileType.folder ? item.folder!.name : item.notebook!.name;
      return {name, id};
    });
  } catch (e) {
    throw new Error('Error in calculation path for notebook');
  }
}
