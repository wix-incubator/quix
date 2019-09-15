import {IScope as ngIscope} from 'angular';
import {INote} from '@wix/quix-shared';

export interface IScope extends ngIscope {
  note: INote;
  vm: any;
}
