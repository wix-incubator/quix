import {IScope as ngIScope} from 'angular';
import {RunnerQuery} from '../../..';

export interface IScope extends ngIScope {
  query: RunnerQuery;
}
