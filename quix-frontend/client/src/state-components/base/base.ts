import {inject, initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {search} from '../../store/app/app-actions'

export default (app: App, store: Store) => ({
  name: 'base',
  abstract: true,
  template: '<div ui-view class="bi-c-h bi-grow" bi-state-loader></div>',
  url: {
    searchText: text => search(text)
  },
  scope: {},
  controller: (scope, params, {syncUrl}) => {
    syncUrl();
  },
  link: (scope) => {
    let searchPopup, searchPopupScope, maximizable;

    initNgScope(scope)
      .withEvents({
        onMaximizableLoad(instance) {
          maximizable = instance;
          maximizable.toggle();
        },
        onMaximizableToggle(maximized: boolean) {
          if (!maximized && searchPopup) {
            searchPopup.remove();
            searchPopupScope.$destroy();
            searchPopup = null;
            searchPopupScope = null;
            maximizable = null;

            store.dispatch(search(null, 'user'));
          }
        }
      })

    store.subscribe('app.searchText', text => {
      if (!text) {
        return maximizable && maximizable.toggle();
      }

      if (!searchPopup) {
        searchPopupScope = scope.$new();
        searchPopup = inject('$compile')(`
          <div 
            class="quix-search-popup bi-c-h"
            bi-maximizable="false"
            on-load="events.onMaximizableLoad(instance)"
            on-toggle="events.onMaximizableToggle(maximized)"
          >
            <quix-search-results class="bi-c-h bi-grow"></quix-search-results>
          </div>
        `)(searchPopupScope).appendTo(document.body);
      }
    }, scope);
  }
}) as IStateComponentConfig;
