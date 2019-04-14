import {INotebook} from '../../../../shared';

export interface IScope extends angular.IScope {
  notebook: INotebook[];
}
