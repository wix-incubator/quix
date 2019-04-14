import {inject} from '../../core';
import {default as dialog} from './dialog';

function init(promise) {
  let {scope, element} = promise;
  scope = scope();
  element = element();

  scope.dialogOptions.showCloseButton = false;

  const yesText = element.attr('yes');
  const noText = element.attr('no');

  element
    .addClass('bi-confirm')
    .append(inject('$compile')(`
      <dialog-footer class="bi-justify-right bi-space-h">
        <button class="bi-button" ng-click="dialogEvents.reject()">${noText ? noText : 'No'}</button>
        <button class="bi-button--primary" ng-click="dialogEvents.resolve()" ng-disabled="form && !form.$valid">${yesText ? yesText : 'Yes'}</button>
      </dialog-footer>
    `)(scope));

  return promise;
}

export default function(elelmentOrHtml, scope?, locals?) {
  return init(dialog(elelmentOrHtml, scope, locals));
}
