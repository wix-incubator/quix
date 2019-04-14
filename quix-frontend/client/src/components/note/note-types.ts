import {IScope as ngIscope} from 'angular';
import {INote} from '../../../../shared';

export interface IScope extends ngIscope {
  note: INote;
  vm: any;
}
