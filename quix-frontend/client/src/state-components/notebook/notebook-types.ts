import {INotebook} from '@wix/quix-shared';

export interface IScope extends angular.IScope {
  notebook: INotebook;
}
