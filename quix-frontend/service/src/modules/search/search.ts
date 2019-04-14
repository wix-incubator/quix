import {Repository, Like, FindOperator} from 'typeorm';
import {ISearch} from './types';
import {isEmpty} from 'lodash';
import {DbNote} from '../../entities';

enum SearchTypes {
  user = 'user:',
  type = 'type:',
  notebookName = 'name:',
}

interface SearchQuery {
  content?: FindOperator<string>;
  owner?: string;
  type?: string;
  name?: string;
}

export class Search implements ISearch {
  constructor(private repo: Repository<DbNote>) {}

  private getSearchContent(
    contentParts: string[],
    searchType: SearchTypes,
  ): string | undefined {
    const suitableIndex = Object.keys(SearchTypes)
      .map((key, idx: number) => idx)
      .find(
        index =>
          !!contentParts[index] && contentParts[index].startsWith(searchType),
      );

    if (
      !isNaN(suitableIndex as number) &&
      !!contentParts[suitableIndex as number]
    ) {
      return contentParts[suitableIndex as number].split(searchType)[1];
    }
  }

  private createSearchQueryObject(
    freeText: string,
    searchUserContent?: string,
    searchTypeContent?: string,
    searchNotebookNameContent?: string,
  ): SearchQuery {
    const returnedObj: SearchQuery = {};

    if (searchUserContent) {
      returnedObj.owner = searchUserContent;
    }

    if (searchTypeContent) {
      returnedObj.type = searchTypeContent;
    }

    if (searchNotebookNameContent) {
      returnedObj.name = searchNotebookNameContent;
    }

    if (freeText) {
      // this solution prevent from searching % key by itself
      // but '%pref' for example, indeed works.
      const queryString = Like(`\%${freeText}\%`);
      returnedObj.content = queryString;
    }

    return returnedObj;
  }

  private isStartWithFreeText(content: string) {
    return (
      !content.startsWith(SearchTypes.user) &&
      !content.startsWith(SearchTypes.type) &&
      !content.startsWith(SearchTypes.notebookName)
    );
  }

  async search(content: string): Promise<DbNote[]> {
    if (!content) {
      return [];
    }

    let searchUserContent;
    let searchTypeContent;
    let searchNameContent;

    const contentParts = content.split(' ');
    if (!this.isStartWithFreeText(contentParts[0])) {
      searchUserContent = this.getSearchContent(contentParts, SearchTypes.user);
      searchTypeContent = this.getSearchContent(contentParts, SearchTypes.type);
      searchNameContent = this.getSearchContent(
        contentParts,
        SearchTypes.notebookName,
      );
    }

    const freeText = this.getFreeText(
      contentParts,
      searchUserContent,
      searchTypeContent,
      searchNameContent,
    );

    const searchObject = this.createSearchQueryObject(
      freeText,
      searchUserContent,
      searchTypeContent,
      searchNameContent,
    );

    if (!isEmpty(searchObject)) {
      let q = this.repo.createQueryBuilder('note');
      const where: string[] = [];
      const whereArgs: any = {};
      if (searchObject.owner) {
        where.push('note.owner = :owner');
        whereArgs.owner = {owner: searchObject.owner};
      }
      if (searchObject.type) {
        where.push('note.type = :type');
        whereArgs.type = {type: searchObject.type};
      }
      if (searchObject.name) {
        where.push('note.name = :name');
        whereArgs.name = {name: searchObject.name};
      }
      if (searchObject.content) {
        where.push(
          `MATCH(note.textContent) AGAINST ('${
            searchObject.content
          }' IN BOOLEAN MODE)`,
        );
      }
      const whereSql = where.join(' AND ');
      q = q.where(whereSql, whereArgs);
      const results = await q.getMany();
      return results;
    }

    return [];
  }

  private getFreeText(
    contentParts: string[],
    searchUserContent: string | undefined,
    searchTypeContent: string | undefined,
    searchNotebookNameContent: string | undefined,
  ): string {
    let freeTextIndex = 0;
    if (searchUserContent) {
      freeTextIndex++;
    }

    if (searchTypeContent) {
      freeTextIndex++;
    }

    if (searchNotebookNameContent) {
      freeTextIndex++;
    }

    return contentParts[freeTextIndex];
  }
}
