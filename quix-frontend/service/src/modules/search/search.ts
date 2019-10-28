import {dbConf} from 'config/db-conf';
import {Repository, Connection} from 'typeorm';
import {DbNote} from '../../entities';
import {isValidQuery, parse} from './parser';
import {ISearch} from './types';
import {Injectable} from '@nestjs/common';
import {InjectRepository, InjectConnection} from '@nestjs/typeorm';
import {convertDbNote} from 'entities/note/dbnote.entity';
import {INote} from 'shared';

@Injectable()
export class SearchService implements ISearch {
  constructor(
    @InjectRepository(DbNote) private repo: Repository<DbNote>,
    @InjectConnection() private connection: Connection,
  ) {}

  async search(
    content: string,
    total = 50,
    offset = 0,
  ): Promise<[INote[], number]> {
    if (!content) {
      return [[], 0];
    }

    const searchQuery = parse(content);

    if (isValidQuery(searchQuery)) {
      const where: string[] = [];
      const whereArgs: any = {};

      if (searchQuery.owner) {
        where.push('note.owner = :owner');
        whereArgs.owner = searchQuery.owner;
      }

      if (searchQuery.type) {
        where.push('note.type = :type');
        whereArgs.type = searchQuery.type;
      }

      if (searchQuery.name) {
        where.push('note.name = :name');
        whereArgs.name = searchQuery.name;
      }

      if (searchQuery.content.length) {
        where.push(
          dbConf.fullTextSearch('note.textContent', searchQuery.content),
        );
      }

      const whereSql = where.join(' AND ');

      const q = this.connection
        .createQueryBuilder()
        .select('note.id', 'id')
        .addSelect('note.json_content', 'jsonContent')
        .addSelect('note.textContent', 'textContent')
        .addSelect('note.type', 'type')
        .addSelect('note.name', 'name')
        .addSelect('note.owner', 'owner')
        .addSelect('note.date_updated', 'dateUpdated')
        .addSelect('note.date_created', 'dateCreated')
        .addSelect('note.notebookId', 'notebookId')
        .from(
          qb =>
            qb
              .select('*')
              .addSelect(dbConf.fullTextSearch('note.textContent', searchQuery.content), 'relevance')
              .from(DbNote, 'note')
              .where(whereSql, whereArgs)
              .orderBy('relevance'),
          'note',
        )
        .take(total)
        .skip(offset);

      const countQuote = this.repo
        .createQueryBuilder('note')
        .where(whereSql, whereArgs);

      const [notes, count] = await Promise.all([
        q.getRawMany(),
        countQuote.getCount(),
      ]);

      return [notes.map(n => convertDbNote(new DbNote(n))), count];
    }

    return [[], 0];
  }
}
