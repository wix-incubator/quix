import {initNgScope, inject} from '../../../core';
import {last} from 'lodash';
import {IScope} from 'angular';

import template from './tabs-router.html';
import './tabs.scss';

export interface IBiTab {
  name: string;
  title: string;
  icon: string;
  id: string;
}

export interface TabsRouterScope extends IScope {
  tabs: IBiTab[];
}

export default () => {
  const $state = inject('$state');

  return {
    restrict: 'E',
    template,
    transclude: true,
    scope: {
      tabs: '<',
      btOptions: '='
    },

    link(scope: TabsRouterScope, element: JQuery, attr: ng.IAttributes, ctrls) {
      initNgScope(scope)
        .withOptions('btOptions', {
          mode: 'default', // default | flat
        })
        .withVM({
          tabs: {
            $init() {
              this.current = last($state.current.name.split('.'));
              this.all = scope.tabs;
            },
          }
        })
        .withEvents({
          onTabClick(tabName: string) {
            scope.vm.tabs.current = tabName;
            $state.go(`^.${tabName}`);
          }
        });

      element.addClass(`bi-tabs--${scope.options.mode}`);
    }
  };
};
