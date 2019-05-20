import {IScope as ngIscope} from 'angular';
import {IFile} from '../../../../shared';

export interface IScope extends ngIscope {
  vm: any;
  model: IFile;
  context: 'folder' | 'notebook'
}
