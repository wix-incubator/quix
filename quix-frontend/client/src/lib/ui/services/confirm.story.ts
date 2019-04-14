import {inject} from '../../../core';
import {default as confirm} from './confirm';

export default app => app
  .story('UI', 'Dialog')
    .section('Confirm dialog', `
      <button class="bi-button--primary" ng-click="showConfirm()">show confirm dialog</button>

      <code>import {confirm} from '@wix/bi-ui';</code>
      <output>{{output}}</output>

      <dialog class="confirm" yes="continue" no="nope" ng-non-bindable>
        <dialog-title>my custom confirm dialog</dialog-title>
        <dialog-content>Are you sure you want to continue?</dialog-content>
      </dialog>
    `, (scope, element) => {
      scope.showConfirm = () => confirm(element.find('dialog.confirm'), scope)
        .then(() => scope.output = 'resolved', () => scope.output = 'rejected');
    })
    .section('Deferred confirm', `
      <button class="bi-button--primary" ng-click="showDeferred()">show deferred</button>
      <button class="bi-button--primary" ng-click="showDeferredWithError()">show deferred with error</button>

      <dialog class="deferred-confirm" on-confirm="onConfirm()" ng-non-bindable>
        <dialog-title>deferred confirm</dialog-title>
        <dialog-content>Are you sure you want to continue?</dialog-content>
      </dialog>

      <dialog class="deferred-confirm-error" on-confirm="onConfirmWithError()" ng-non-bindable>
        <dialog-title>deferred confirm</dialog-title>
        <dialog-content>Are you sure you want to continue?</dialog-content>
      </dialog>
    `, (scope, element) => {
      scope.showDeferred = () => confirm(element.find('dialog.deferred-confirm'), scope);
      scope.showDeferredWithError = () => confirm(element.find('dialog.deferred-confirm-error'), scope);
      scope.onConfirm = () => inject('$timeout')(() => true, 3000);
      scope.onConfirmWithError = () => inject('$timeout')(() => {
        return inject('$q').reject({errorDescription: 'Deferred error!'});
      }, 3000);
    });
