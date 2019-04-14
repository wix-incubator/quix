/* This file is the bundle entry point */
import {Socket} from './srv/socket/socket';
import {BufferedCollection, Collection, PartitionedCollection} from './srv/collections';
import {EventEmitter} from './srv/event-emitter';
import {injector} from './srv/injector';
import {init} from './ang/srv/scope';
import {create, IScope as IScope_, Model} from './ang/srv/ng-model/ng-model';
import {create as createVM, ViewModel as ViewModel_} from './srv/view-model/view-model';
import * as biUtils from './utils';

import './main.angular';

export const utils = biUtils;
export const srv = {
  collections: {BufferedCollection, Collection, PartitionedCollection},
  Model,
  Socket,
  eventEmitter: {
    EventEmitter
  },
  viewModel: {
    ViewModel: ViewModel_
  },
  injector
};
export const initNgScope = init;
export const createNgModel = create;
export const inject = injector.get;
export const createViewModel = createVM;
export type IScope<T> = IScope_<T>;
export {Config} from './config';
