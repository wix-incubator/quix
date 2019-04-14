import template from './app.html';
import './app.scss';

import {find, without} from 'lodash';
import {initNgScope, inject} from '../../../core';
import {IMenuItem} from '../../services/instance';
import {Instance} from '../..';
import {Apps} from '../../constants';

export interface IScope extends ng.IScope {
  app: Instance;
}

function setCurrentMenuItem(scope: IScope, item: IMenuItem) {
  return scope.vm.menu.current = item;
}

export default () => {
  return {
    restrict: 'E',
    template,
    transclude: {
      header: '?header'
    },
    scope: {
      app: '='
    },
    link: {
      pre(scope: IScope) {
        scope.user = scope.app.getUser();

        initNgScope(scope)
          .withVM({
            apps: without(Apps, find(Apps, {id: scope.app.getId()})),
            menu: {
              current: null
            }
          })
          .withEvents({
            onMenuItemToggle(item: IMenuItem) {
              const {menu} = scope.vm;
              const {current} = menu;

              if (typeof item.onToggle === 'function') {
                item.onToggle(scope.app, item);
                setCurrentMenuItem(scope, item);
              } else {
                setCurrentMenuItem(scope, current === item ? null : item);
              }

              if (scope.vm.menu.current) {
                scope.vm.menu.reload();
              } else {
                scope.vm.menu.toggle(false);
              }

              if (current && current.scope) {
                current.scope.$destroy();
                delete current.scope;
              }
            },
            onAppClick({href}) {
              window.open(href, '_blank');
            },
            onTitleClick() {
              scope.app.getNavigator().goHome();
            }
          });

        scope.compileMenuItem = (item: IMenuItem) => {
          (item as any).scope = scope.$new(true);

          return {html: item.compiled || inject('$compile')(item.template)((item as any).scope)};
        };

        scope.app.getNavigator().listen(scope.app.getMenuItems().map(item => item.name), 'start', (params, stateName) => {
          scope.app.getMenuItems().some(item => {
            if (!item.name) {
              return;
            }

            return stateName.indexOf(item.name) >= 0 && !!(setCurrentMenuItem(scope, item) || true);
          });
        }, scope).otherwise(() => scope.vm.menu.current && scope.vm.menu.current.name && setCurrentMenuItem(scope, null));
      }
    }
  };
};
