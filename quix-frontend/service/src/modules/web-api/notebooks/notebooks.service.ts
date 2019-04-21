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
import {FoldersService} from '../folders/folders.service';

@Injectable()
export class NotebookService {
  constructor(
    @InjectRepository(DbNotebook) private notebookRepo: Repository<DbNotebook>,
    private folderService: FoldersService,
  ) {}

  async getId(getId: string): Promise<INotebook | undefined> {
    const notebook = await this.notebookRepo.findOne(getId, {
      relations: ['notes', 'fileNode'],
    });

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
