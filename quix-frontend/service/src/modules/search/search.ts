import {dbConf} from 'config/db-conf';
import {Repository} from 'typeorm';
import {DbNote} from '../../entities';
import {isValidQuery, parse} from './parser';
import {ISearch} from './types';

export class Search implements ISearch {
  constructor(private repo: Repository<DbNote>) {}

  async search(content: string): Promise<DbNote[]> {
    if (!content) {
      return [];
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

      q = q.where(whereSql, whereArgs);

      const results = await q.getMany();
      return results;
    }

    return [];
  }
}
