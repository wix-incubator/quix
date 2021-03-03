import {EntityRepository, Repository} from 'typeorm';
import {DbNote} from './dbnote.entity';

@EntityRepository(DbNote)
export class NoteRepository extends Repository<DbNote> {
  async insertNewWithRank(note: DbNote) {
    const currentCount = await this.count({notebookId: note.notebookId});
    note.rank = currentCount;
    return this.insert(note);
  }

  async deleteOneAndOrderRank(item: string | DbNote) {
    const note =
      typeof item === 'string' ? await this.findOneOrFail(item) : item;

    return this.manager.transaction(async em => {
      await em
        .createQueryBuilder()
        .update(DbNote)
        .set({
          rank: () => '`rank` - 1',
        })
        .where(`notebookId = :notebookId`, {notebookId: note.notebookId})
        .andWhere(`rank > :rank`, {rank: note.rank})
        .execute();
      await em.delete(DbNote, note.id);
    });
  }

  async reorder(note: DbNote, to: number) {
    return this.manager.transaction(async em => {
      const from = note.rank;
      if (from === undefined) {
        throw new Error('invalid note state, missing rank property');
      }

      if (from === to) {
        return;
      }

      if (from > to) {
        await em
          .createQueryBuilder()
          .update(DbNote)
          .set({
            rank: () => '`rank` + 1',
          })
          .where(`notebookId = :notebookId`, {notebookId: note.notebookId})
          .andWhere(`rank between :to and :from`, {from: from - 1, to})
          .execute();
      } else if (from < to) {
        await em
          .createQueryBuilder()
          .update(DbNote)
          .set({
            rank: () => '`rank` - 1',
          })
          .where(`notebookId = :notebookId`, {notebookId: note.notebookId})
          .andWhere(`rank between :from and :to`, {from: from + 1, to})
          .execute();
      }

      await em.update(DbNote, note.id, {rank: to});
    });
  }
}
