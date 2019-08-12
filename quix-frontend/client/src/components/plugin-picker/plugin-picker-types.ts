import {IScope as ngIscope} from 'angular';
import {ModuleComponentType} from '../../../../shared';

export interface IScope extends ngIscope {
  vm: any;
  model: string;
  pluginType: ModuleComponentType;
  onChange: Function;
}
