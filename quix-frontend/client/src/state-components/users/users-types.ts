import {IUser } from '../../../../shared';

export interface IScope extends angular.IScope {
  users: IUser[];
  vm: any;
}
