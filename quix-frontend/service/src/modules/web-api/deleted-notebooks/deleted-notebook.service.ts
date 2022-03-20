import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IDeletedNotebook} from '@wix/quix-shared';
import {DbUser, DbDeletedNotebook} from '../../../entities';
import {convertDbDeletedNotebook} from '../../../entities/deleted-notebook/dbdeleted-notebook.entity';

@Injectable()
export class DeletedNotebooksService {
  constructor(
    @InjectRepository(DbDeletedNotebook)
    private deletedNotebooksRepo: Repository<DbDeletedNotebook>,
  ) {}

  async getDeletedNotebooksForUser(user: string): Promise<IDeletedNotebook[]> {
    const query = this.deletedNotebooksRepo
      .createQueryBuilder('dn')
      .leftJoinAndMapOne(
        'dn.ownerDetails',
        DbUser,
        'user',
        'dn.owner = user.id',
      )
      .where('dn.owner = :user', {user})
      .orderBy({'dn.name': 'ASC'});

    const res = await query.getMany();
    return res.map(dn => convertDbDeletedNotebook(dn));
  }

  async getCountDeletedNotebooksForUser(user: string): Promise<number> {
    return await this.deletedNotebooksRepo.count({where: {owner: user}});
  }
}
