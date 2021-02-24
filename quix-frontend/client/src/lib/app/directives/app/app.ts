import template from './app.html';
import './app.scss';

import {find, without} from 'lodash';
import {initNgScope, inject} from '../../../core';
import {IMenuItem} from '../../services/app';
import {App} from '../..';
import {Apps} from '../../constants';

export interface IScope extends ng.IScope {
  app: App;
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
            apps: without(Apps, find(Apps, {id: scope.app.getId()} as any)),
            header: {},
            menu: {
              current: null,
              content: {},
            },
            loginHint: {}
          })
          .withEvents({
            onMenuItemToggle(item: IMenuItem) {
              const {current, content} = scope.vm.menu;

              if (!item.template) {
                item.onToggle && item.onToggle(scope.app, item);
                return;
              }

              if (typeof item.onToggle === 'function') {
                item.onToggle(scope.app, item);
                setCurrentMenuItem(scope, item);
              } else {
                setCurrentMenuItem(scope, current === item ? null : item);
              }

              if (scope.vm.menu.current) {
                content.reload();
              } else {
                content.toggle(false);
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

        scope.app.getNavigator().listen(scope.app.getMenuItems().map(item => item.state).filter(state => state), 'start', (params, stateName) => {
          scope.app.getMenuItems().some(item => {
            if (!item.state) {
              return false;
            }

            return stateName.indexOf(item.state) >= 0 && !!(setCurrentMenuItem(scope, item) || true);
          });
        }, scope).otherwise(() => scope.vm.menu.current && scope.vm.menu.current.state && setCurrentMenuItem(scope, null));

        scope.app.getStore().subscribe('app', ({header, menu}) => {
          scope.vm.header.toggle(header);
          scope.vm.menu.toggle(menu);
        }, scope);

        inject('$timeout')(() => scope.vm.loginHint.toggle(true), 5000);
      }
    }
  };
};
