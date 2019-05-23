import {IScope as ngIscope} from 'angular';

export interface IScope extends ngIscope {
  name: string;
  src: string;
}
