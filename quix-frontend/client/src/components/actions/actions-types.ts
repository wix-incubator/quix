import {IScope as ngIscope} from 'angular';
import {INotebook, INote} from '../../../../shared';

export interface IScope extends ngIscope {
  entity: INotebook | INote
  vm: any;
}
