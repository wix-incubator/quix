import {defaults, assign} from 'lodash';
import {inject} from '../../core';
import {default as dialog, IDialogOptions} from './dialog';

export interface IConfirmOptions extends IDialogOptions {
  actionType: 'create' | 'destroy' | 'neutral';
  icon?: string;
  yes?: string;
  no?: string;
}

function init(htmlOrOptions: string | IConfirmOptions , promise: any) {
  let {scope, element} = promise;
  let options: Partial<IConfirmOptions>;

  scope = scope();
  element = element();

  if (typeof htmlOrOptions === 'string') {
    options = {
      actionType: 'neutral',
      yes: element.attr('yes'),
      no: element.attr('no')
    };
  } else {
    options = htmlOrOptions;
  }

  options = defaults({}, options, {
    actionType: 'neutral',
    yes: 'yes',
    no: 'cancel'
  });

  scope.dialogOptions.showCloseAction = false;
  scope.dialogOptions.iconClass = options.actionType === 'destroy' ? 'bi-danger' : 'bi-primary';

  element
    .addClass('bi-confirm')
    .append(inject('$compile')(`
      <dialog-footer class="bi-justify-right bi-space-h">
        <button 
          class="bi-button"
          ng-click="dialogEvents.reject()"
        >{{::confirmOptions.no}}</button>

        <button
          ng-class="::{
            destroy: 'bi-button--danger',
            create: 'bi-button--success',
            neutral: 'bi-button--primary'
          }[confirmOptions.actionType]"
          ng-click="dialogEvents.resolve()"
          ng-disabled="form && !form.$valid"
        >{{::confirmOptions.yes}}</button>
      </dialog-footer>
    `)(assign(scope, {confirmOptions: options})));

  return promise;
}

export default function(htmlOrOptions: string | IConfirmOptions, scope?, locals?) {
  return init(htmlOrOptions, dialog(htmlOrOptions, scope, locals));
}
