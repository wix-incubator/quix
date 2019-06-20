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

    const res = await favoritesQuery.execute();

    return res.map(({notebook_id, notebook_name, fav_entity_type}: any) => ({
      id: notebook_id,
      name: notebook_name,
      type: fav_entity_type,
      path: [],
    }));
  }
}
