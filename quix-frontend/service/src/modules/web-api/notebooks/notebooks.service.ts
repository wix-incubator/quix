import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {INotebook} from 'shared';
import {DbNotebook, DbFavorites, DbUser} from 'entities';
import {FoldersService} from '../folders/folders.service';
import {EntityType} from 'common/entity-type.enum';
import {convertDbNotebook} from 'entities/notebook/dbnotebook.entity';

@Injectable()
export class NotebookService {
  constructor(
    @InjectRepository(DbNotebook) private notebookRepo: Repository<DbNotebook>,
    @InjectRepository(DbFavorites)
    private favoritesRepo: Repository<DbFavorites>,
    private folderService: FoldersService,
  ) {}

  async getNotebook(
    user: string,
    notebookId: string,
  ): Promise<INotebook | undefined> {
    const notebookQuery = this.notebookRepo
      .createQueryBuilder('notebook')
      .leftJoinAndSelect('notebook.fileNode', 'fileNode')
      .leftJoinAndSelect('notebook.notes', 'note')
      .leftJoinAndMapOne(
        'notebook.ownerDetails',
        DbUser,
        'user',
        'notebook.owner = user.id',
      )
      .where('notebook.id = :id', {id: notebookId})
      .orderBy({'note.rank': 'ASC'});

    const [notebook, favorite] = await Promise.all([
      notebookQuery.getOne(),
      this.favoritesRepo.findOne({
        owner: user,
        entityId: notebookId,
      }),
    ]);

    if (!notebook) {
      return undefined;
    }

    const isLiked = !!favorite;
    const path = await this.folderService.computePath(notebook.fileNode);

    return convertDbNotebook(notebook, path, isLiked);
  }
}
