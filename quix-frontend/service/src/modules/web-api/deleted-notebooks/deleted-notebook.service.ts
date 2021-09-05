import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IDeletedNotebook} from '@wix/quix-shared';
import {DbUser, DbDeletedNotebook} from '../../../entities';
import {extractOwnerDetails} from '../../../entities/utils';

type GetDeletedNotebooksQueryReturnValue = DbDeletedNotebook & {
  deletedNotebook: DbDeletedNotebook;
  deletedNotebookOwnerDetails?: DbUser;
};

function deletedNotebooksToIDeletedNotebooks(dn: GetDeletedNotebooksQueryReturnValue): IDeletedNotebook {
  const {deletedNotebook, deletedNotebookOwnerDetails} = dn;
  deletedNotebook.ownerDetails = deletedNotebookOwnerDetails;
  const {id, owner, dateCreated, dateUpdated,dateDeleted, name} = deletedNotebook;
  const ownerDetails = extractOwnerDetails(deletedNotebook);

  return {
    isLiked: true,
    ownerDetails,
    owner,
    id,
    dateCreated,
    dateUpdated,
    dateDeleted,
    path: [],
    name,
    notes:[]
  };
}

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
        'dn.notebookOwnerDetails',
        DbUser,
        'user',
        'dn.owner = user.id',
      )
      .where('dn.owner = :user', {user})
      .orderBy({'dn.date_deleted': 'ASC'});

    const res = (await query.getMany()) as GetDeletedNotebooksQueryReturnValue[];

    return res.map(deletedNotebooksToIDeletedNotebooks);
  }
}
