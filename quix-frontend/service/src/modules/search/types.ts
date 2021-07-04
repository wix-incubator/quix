import {INote, SearchQuery} from '@wix/quix-shared';

export interface ISearch {
  search(content: string): Promise<[INote[], number, SearchQuery]>;
}
