import {INote} from '../note/types';
import {IEntity} from '../common/common-types';
import {IFilePathItem} from '../file/types';

export interface INotebook extends IEntity {
  notes: INote[];
  path: IFilePathItem[];
  isLiked: boolean;
}
