import {IEntity} from '../common/common-types';
import {IFilePathItem} from '../file';

export interface IFolder extends IEntity {
  path: IFilePathItem[];
  files: IFilePathItem[];
  isLiked: boolean;
}
