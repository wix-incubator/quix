import template from './plugin-picker.html';
import './plugin-picker.scss';

import {initNgScope, createNgModel, inject} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './plugin-picker-types';
import {pluginManager} from '../../plugins';

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  require: 'ngModel',
  scope: {
    type: '@',
    filter: '&',
    onChange: '&',
    onLoad: '&',
  },
  link: {
    async pre(scope: IScope, element, attr, ngModel) {
      createNgModel(scope, ngModel)
        .watchWith(() => scope.state.save())
        .then(() => {
          initNgScope(scope)
          .withVM({
            plugins: pluginManager.module(scope.type)
              .plugins()
              .filter(plugin => !scope.filter() || scope.filter()(plugin))
              .map(plugin => plugin.getId()),
            $export() {
              return {type: scope.model};
            },
            $import({type}) {
              scope.model = this.plugins.includes(type) ? type : null;
            }
          })
          .withState('pluginPicker', 'pluginPicker', {});
        });

      inject('$timeout')(() => {
        scope.model = scope.model || scope.vm.plugins[0];
        scope.onLoad({plugin: scope.model});
      });  
    }
  }
});
