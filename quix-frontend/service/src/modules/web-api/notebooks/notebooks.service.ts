import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {INotebook} from 'shared';
import {DbNotebook, DbFileTreeNode} from 'entities';
import {FoldersService} from '../folders/folders.service';

@Injectable()
export class NotebookService {
  constructor(
    @InjectRepository(DbNotebook) private notebookRepo: Repository<DbNotebook>,
    private folderService: FoldersService,
  ) {}

  async getId(getId: string): Promise<INotebook | undefined> {
    const q = this.notebookRepo
      .createQueryBuilder('notebook')
      .leftJoinAndSelect('notebook.fileNode', 'fileNode')
      .leftJoinAndSelect('notebook.notes', 'note')
      .where('notebook.id = :id', {id: getId})
      .orderBy({
        'note.rank': 'ASC',
      });

    const notebook = await q.getOne();

    if (!notebook) {
      return undefined;
    }

    const path =
      (await this.folderService.computePath(notebook.fileNode)) || [];
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
}
