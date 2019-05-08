import {IScope as ngIscope} from 'angular';
import {IEntity} from '../../../../shared';

export interface IScope extends ngIscope {
  entity: IEntity
  vm: any;
}
