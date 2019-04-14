import {default as dialog} from './dialog';

export default app => app
  .story('UI', 'Dialog')
    .section('Dialog', `
      <button class="bi-button--primary" ng-click="showDialog()">show dialog</button>

      <code>import {dialog} from '@wix/bi-ui';</code>
      <output>{{output}}</output>

      <dialog class="dialog" ng-non-bindable>
        <dialog-title>my custom dialog</dialog-title>
        <dialog-content>Dialog content</dialog-content>
      </dialog>
    `, (scope, element) => {
      scope.showDialog = () => {
        dialog(element.find('dialog.dialog'), scope).then(() => scope.output = 'resolved', () => scope.output = 'rejected');
      };
    });
