import { IFile } from '../../../../shared';

export interface IScope extends angular.IScope {
  favorites: IFile[];
  vm: any;
}
