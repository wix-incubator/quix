import {IScope as ngIscope} from 'angular';
import {ModuleComponentType} from '@wix/quix-shared';

export interface IScope extends ngIscope {
  vm: any;
  model: string;
  pluginType: ModuleComponentType;
  onChange: Function;
}
