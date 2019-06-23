import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IFile} from 'shared';
import {DbNotebook, DbFavorites} from 'entities';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(DbFavorites)
    private favoritesRepo: Repository<DbFavorites>,
  ) {}

  async getFavoritesForUser(user: string): Promise<IFile[]> {
    const favoritesQuery = this.favoritesRepo
      .createQueryBuilder('fav')
      .leftJoinAndMapOne(
        'notebook',
        DbNotebook,
        'notebook',
        'fav.entityId = notebook.id',
      )
      .where('fav.owner = :user', {user})
      .orderBy({'notebook.name': 'ASC'});

    const res: IFile[] = await favoritesQuery.execute();

    return res.map(
      ({
        notebook_id,
        notebook_name,
        notebook_owner,
        notebook_date_created,
        notebook_date_updated,
        fav_entity_type,
      }: any) => ({
        id: notebook_id,
        name: notebook_name,
        owner: notebook_owner,
        type: fav_entity_type,
        isLiked: true,
        path: [],
        dateCreated: notebook_date_created.valueOf(),
        dateUpdated: notebook_date_updated.valueOf(),
      }),
    );
  }
}
