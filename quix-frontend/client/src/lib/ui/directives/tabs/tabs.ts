import {initNgScope, inject} from '../../../core';
import {IScope} from 'angular';

import template from './tabs.html';
import './tabs.scss';

export interface IBiTab {
  name: string;
  title: string;
  icon: string;
}

export interface IScope extends ng.IScope {
  tabs: IBiTab[];
}

export default () => {
  const $timeout: ng.ITimeoutService = inject('$timeout');
  return {
    restrict: 'E',
    template,
    transclude: true,
    scope: {
      tabs: '<',
      btCurrent: '=',
      btOptions: '=',
      onChange: '&'
    },

    link(scope: IScope, element: JQuery, attr: ng.IAttributes, ctrls, transclude: ng.ITranscludeFunction) {
      initNgScope(scope)
        .withOptions('btOptions', {
          mode: 'default', // default | flat
          headerClass: [],
          contentClass: []
        })
        .withVM({
          tabs: {
            $init() {
              this.current = scope.btCurrent || scope.tabs[0].name;
              this.all = scope.tabs;
            },
          }
        })
        .withEvents({
          onTabClick(tabName: string) {
            scope.vm.tabs.current = tabName;
            $timeout(() => scope.onChange({tab: tabName}));
          }
        });

      transclude((clone, transcludedScope) => {
        element.find('.bi-tabs-content').append(clone);

        transcludedScope.tabs = {
          get current() {
            return scope.vm.tabs.current;
          }
        };
      });

      element.addClass(`bi-tabs--${scope.options.mode}`);
      scope.$watch('btCurrent', current => current && (scope.vm.tabs.current = current));
    }
  };
};
