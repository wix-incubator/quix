import {dbConf} from '../../config/db-conf';
import {Repository} from 'typeorm';
import {DbNote} from '../../entities';
import {isValidQuery, parse} from './parser';
import {ISearch} from './types';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {convertDbNote} from '../../entities/note/dbnote.entity';
import {INote} from '@wix/quix-shared';

@Injectable()
export class SearchService implements ISearch {
  constructor(@InjectRepository(DbNote) private repo: Repository<DbNote>) {}

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
      let q = this.repo.createQueryBuilder('note');
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

      q = q.take(total).skip(offset).where(whereSql, whereArgs);

      const [notes, count] = await q.getManyAndCount();
      return [notes.map(convertDbNote), count];
    }

    return [[], 0];
  }
}
