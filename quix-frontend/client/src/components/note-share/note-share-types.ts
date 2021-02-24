import {IScope as ngIscope} from 'angular';
import {INote, INotebook} from '@wix/quix-shared';

export interface IScope extends ngIscope {
  note: INote;
  notebook: INotebook;
  params: any;
  vm: any;
}
