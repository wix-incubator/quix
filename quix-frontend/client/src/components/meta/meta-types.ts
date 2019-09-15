import {IScope as ngIscope} from 'angular';
import {IEntity} from '@wix/quix-shared';

export interface IScope extends ngIscope {
  entity: IEntity
  vm: any;
}
