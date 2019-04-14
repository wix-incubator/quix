import {IEntity} from '../common/common-types';

export enum FileType {
  folder = 'folder',
  notebook = 'notebook'
}

export interface IFile extends IEntity {
  type: FileType;
  path: IFilePathItem[];
  isLiked: boolean;
}

export interface IFilePathItem {
  id: string;
  name: string;
}
