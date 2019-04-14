import {isPlainObject} from 'lodash';
import {Store} from '../../../lib/store';

export const initScopeListeners = (scope, store: Store, listeners) => {
  Object.keys(listeners).forEach(key => {
    const listener = listeners[key];
    const watched = {};

    scope.$watch(key, (current, prev) => {
      if (isPlainObject(listener)) {
        const {self, ...props} = listener;

        Object.keys(props).forEach(prop => {
          if (!current || (prev && current[prop] === prev[prop] && watched[key + prop])) {
            return;
          }

          listener[prop](scope, current[prop], prev && prev[prop], store);
          watched[key + prop] = true;
        });

        if (self) {
          self(scope, current, prev, store);
        }
      } else {
        listener(scope, current, prev, store);
      }
    });
  });
};
