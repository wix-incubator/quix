import 'reflect-metadata';
import {createConnection} from 'typeorm';
import {DbNotebook, DbFavorites} from '../../../entities';

async function main() {
  const conn = await createConnection();
  const notebookRepo = conn.getRepository(DbNotebook);

  const q = notebookRepo
    .createQueryBuilder('notebook')
    // .leftJoinAndSelect('notebook.fileNode', 'fileNode')
    // .leftJoinAndSelect('notebook.notes', 'note')
    .leftJoinAndMapOne(
      'isLiked',
      qb =>
        qb
          .from(DbFavorites, 'favorites')
          .select('favorites.entityId is not null', 'liked')
          .where(`favorites.owner = :owner and favorites.entityId = :id`, {
            owner: 'user@quix.com',
            id: '2f819a89-c3eb-47c4-82f5-bce84ba825db',
          }),
      'f1',
      '1 = 1',
    )
    .where('notebook.id = :id', {id: '2f819a89-c3eb-47c4-82f5-bce84ba825db'});

  console.log(q.getQueryAndParameters());
  const result = await q.getOne();
  console.log(result);

  await conn.close();
}

main().finally(() => process.exit(0));
