import {assign, defaults} from 'lodash';
import angular from 'angular';
import {registerDialog} from 'dialog-polyfill';
import {inject} from '../../core';

let instance = {scope: null, dialog: null};

export interface IDialog extends ng.IPromise<any> {
  element(): Object;
  scope(): Object;
}

export interface IDialogOptions {
  html: string;
  title?: string;
  subTitle?: string;
  icon?: string;
  showCloseAction?: boolean;
  onConfirm?(scope): any;
}

function createScope(deferred, scope?, locals?) {
  scope = scope ? scope.$new() : inject('$rootScope').$new(true);

  if (locals) {
    assign(scope, locals);
  }

  scope.dialogEvents = {
    reject() {
      deferred.reject();
    },
    resolve() {
      const res = this.onConfirm(scope);

      if (res && res.then) {
        scope.dialogError = null;
        scope.dialogResolving = true;

        res
          .then(r => deferred.resolve(r, scope), e => scope.dialogError = e)
          .finally(() => scope.dialogResolving = false);
      } else {
        deferred.resolve(scope);
      }
    }
  };

  return scope;
}

function showDialog(scope, htmlOrOptions: string | IDialogOptions) {
  let options: IDialogOptions;

  if (typeof htmlOrOptions === 'string') {
    options = {
      html: htmlOrOptions
    }
  } else {
    options = {
      ...htmlOrOptions,
      html:  `
        <dialog class="bi-theme--lighter">
          <dialog-title class="bi-align bi-s-h">
            ${htmlOrOptions.icon ? `
            <i
              class="bi-dialog-icon bi-icon"
              ng-class="dialogOptions.iconClass"
            >${htmlOrOptions.icon}</i>
          ` : ''}
            <span>${htmlOrOptions.title}</span>
          </dialog-title>

          ${htmlOrOptions.subTitle ? `<dialog-subtitle class="bi-muted">${htmlOrOptions.subTitle}</dialog-subtitle>` : ''}

          <dialog-content class="bi-c-h">
            ${htmlOrOptions.html}
          </dialog-content>
        </dialog>
      `
    };
  }

  options = defaults({}, options, {
    showCloseAction: true
  });

  const element = angular.element(options.html)
    .removeAttr('ng-non-bindable')
    .addClass('bi-dialog')
    .prepend(`
      <span class="bi-dialog-close" ng-if="dialogOptions.showCloseAction">
        <i class="bi-action bi-icon" ng-click="dialogEvents.reject()">close</i>
      </span>
      <span class="bi-dialog-loader bi-spinner" ng-if="dialogResolving"><span>
    `)
    .append(`
      <dialog-error 
        class="bi-danger"
        ng-if="error"
      >{{dialogError.data && dialogError.data.errorDescription || 'Unknown error'}}</dialog-error>
    `);

  scope.dialogEvents.onConfirm = options.onConfirm || (() => inject('$parse')(element.attr('on-confirm'))(scope));

  const dialog = inject('$compile')(element)(assign(scope, {dialogOptions: options}))
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

export default function(htmlOrOptions: string | IDialogOptions, parentScope?, locals?): IDialog {
  destroy(instance);

  const deferred = ((inject('$q') as ng.IQService)).defer();
  const {scope, dialog} = showDialog(createScope(deferred, parentScope, locals), htmlOrOptions);

  const promise = deferred.promise.finally(() => destroy({scope, dialog})) as IDialog;
  promise.element = () => angular.element(dialog);
  promise.scope = () => scope;

  return promise;
}
