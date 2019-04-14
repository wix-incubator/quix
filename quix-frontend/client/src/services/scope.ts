import {mapValues} from 'lodash';
import {Store} from '../lib/store';

export function initEvents(scope, conf, app, store: Store, events) {
  conf.withEvents(mapValues(events, event => (event as any)(scope, store, app)));

  scope.$on('$destroy', () => scope.events.$onDestroy && scope.events.$onDestroy())
}
