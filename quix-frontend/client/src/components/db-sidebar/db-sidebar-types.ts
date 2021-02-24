import {IScope as ngIscope} from 'angular';

export interface IScope extends ngIscope {
  vm: any;
}

export interface ServerTreeItem {
  name: string;
  type: 'catalog' | 'schema' | 'table' | 'column';
  children: ServerTreeItem[];
}