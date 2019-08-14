import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IFile, FileType} from 'shared';
import {DbNotebook, DbFavorites, DbUser} from 'entities';
import {extractOwnerDetails} from 'entities/utils';

type GetFavoritesQueryReturnValue = DbFavorites & {
  notebook: DbNotebook;
  notebookOwnerDetails?: DbUser;
};

function favoriteToIFile(fav: GetFavoritesQueryReturnValue): IFile {
  const {notebook, notebookOwnerDetails} = fav;
  notebook.ownerDetails = notebookOwnerDetails;
  const {id, owner, dateCreated, dateUpdated, name} = notebook;
  const ownerDetails = extractOwnerDetails(notebook);

  return {
    isLiked: true,
    ownerDetails,
    owner,
    id,
    dateCreated,
    dateUpdated,
    path: [],
    name,
    type: FileType.notebook,
  };
}

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
        'fav.notebook',
        DbNotebook,
        'notebook',
        'fav.entityId = notebook.id',
      )
      .leftJoinAndMapOne(
        'fav.notebookOwnerDetails',
        DbUser,
        'user',
        'notebook.owner = user.id',
      )
      .where('fav.owner = :user', {user})
      .orderBy({'notebook.name': 'ASC'});

    const res = (await favoritesQuery.getMany()) as GetFavoritesQueryReturnValue[];
    return res.map(favoriteToIFile);
  }
}
