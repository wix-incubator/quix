import {assign} from 'lodash';
import angular from 'angular';
import {registerDialog} from 'dialog-polyfill';
import {inject} from '../../core';

let instance = {scope: null, dialog: null};

export interface IDialog extends ng.IPromise<any> {
  element(): Object;
  scope(): Object;
}

function createScope(deferred, scope?, locals?) {
  scope = scope ? scope.$new() : inject('$rootScope').$new(true);

  if (locals) {
    assign(scope, locals);
  }

  scope.dialogOptions = {
    showCloseButton: true
  };

  scope.dialogEvents = {
    reject() {
      deferred.reject();
    },
    resolve() {
      const res = this.onConfirm();

      if (res && res.then) {
        scope.error = null;
        scope.resolving = true;

        res
          .then(() => deferred.resolve(scope), e => scope.error = e)
          .finally(() => scope.resolving = false);
      } else {
        deferred.resolve(scope);
      }
    }
  };

  return scope;
}

function showDialog(scope, htmlOrElement) {
  const element = (typeof htmlOrElement === 'string' ? angular.element(htmlOrElement) : htmlOrElement.clone())
    .removeAttr('ng-non-bindable')
    .addClass('bi-dialog')
    .prepend(`
      <span class="bi-dialog-close" ng-if="dialogOptions.showCloseButton">
        <i class="bi-action bi-icon" ng-click="dialogEvents.reject()">close</i>
      </span>
      <span class="bi-dialog-loader bi-spinner" ng-if="resolving"><span>
    `)
    .append(`<dialog-error class="bi-danger" ng-if="error">{{error.data && error.data.errorDescription || 'Unknown error'}}</dialog-error>`);

  scope.dialogEvents.onConfirm = () => inject('$parse')(element.attr('on-confirm'))(scope);

  const dialog = inject('$compile')(element)(scope)
    .on('close', () => scope.dialogEvents.reject())
    .appendTo(window.document.body)
    .get(0);

  registerDialog(dialog);

  inject('$timeout')(() => dialog.showModal());

  return (instance = {scope, dialog});
}

function destroy({scope, dialog}) {
  if (scope) {
    scope.$destroy();
  }

  if (dialog) {
    if (dialog.getAttribute('open') !== null) {
      dialog.close();
    }
    dialog.remove();
  }

  instance = {scope: null, dialog: null};
}

export default function(htmlOrElement, parentScope?, locals?): IDialog {
  destroy(instance);

  const deferred = ((inject('$q') as ng.IQService)).defer();
  const {scope, dialog} = showDialog(createScope(deferred, parentScope, locals), htmlOrElement);

  const promise = deferred.promise.finally(() => destroy({scope, dialog})) as IDialog;
  promise.element = () => angular.element(dialog);
  promise.scope = () => scope;

  return promise;
}
