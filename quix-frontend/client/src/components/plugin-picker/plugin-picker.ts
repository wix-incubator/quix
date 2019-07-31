import template from './plugin-picker.html';
import './plugin-picker.scss';

import {initNgScope, createNgModel} from '../../lib/core';
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
    onChange: '&',
  },
  link: {
    async pre(scope: IScope, element, attr, ngModel) {
      createNgModel(scope, ngModel)
        .watchWith(() => scope.state.save())
        .then(() => {
          initNgScope(scope)
          .withVM({
            $export() {
              return {type: scope.model};
            },
            $import({type}) {
              scope.model = scope.model || (this.plugins.includes(type) ? type : this.plugins[0]);
            },
            plugins: pluginManager.getPluginIdsByType(scope.type)
          })
          .withState('pluginPicker', 'pluginPicker', {});
        });
    }
  }
});
