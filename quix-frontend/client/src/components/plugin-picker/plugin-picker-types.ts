import {IScope as ngIscope} from 'angular';
import { PluginType } from '../../services/plugins';

export interface IScope extends ngIscope {
  vm: any;
  model: string;
  pluginType: PluginType;
  onChange: Function;
}
