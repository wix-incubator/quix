import {last} from 'lodash';
import {inject, utils} from '../../core';

import './toast.scss';

enum Icons {
  success = 'check',
  error = 'error_outline',
}

enum IconClass {
  success = 'bi-success',
  error = 'bi-danger',
}

let instances = [];
let hideTimeout = null;

function createScope(deferred) {
  const scope = inject('$rootScope').$new(true);

  scope.ok = function() {
    deferred.resolve();
  };

  scope.cancel = function() {
    deferred.reject();
  };

  return scope;
}

function show(scope, text, type, okText, cancelText) {
  scope.text = text;
  scope.type = Icons[type];
  scope.okText = okText;
  scope.cancelText = cancelText;
  scope.iconClass = IconClass[type];

  const element = inject('$compile')(`
    <div class="bi-toast bi-align bi-s-h--x3 bi-fade-in">
      <span class="bi-align bi-s-h">
        <span class="bi-icon {{::iconClass}}" ng-if="type">{{::type}}</span>
        <span class="bi-toast-text">{{text}}</span>
      </span>

      <span class="bi-s-h">
        <span class="bi-action bi-label" ng-if="okText" ng-click="ok()">{{::okText}}</span>
        <span class="bi-action bi-label" ng-if="cancelText" ng-click="cancel()">{{::cancelText}}</span>
      </span>
    </div>
  `)(scope);

  instances.push({scope, element});

  inject('$timeout')(() => element.appendTo(window.document.body));
}

function destroy() {
  while (instances.length) {
    const {scope, element} = instances.pop();

    element.remove();
    scope.$destroy();
  }

  inject('$timeout').cancel(hideTimeout);

  hideTimeout = null;
  instances = [];
}

export function showToast({
  text,
  type = null,
  ok = '',
  cancel = '',
  hideDelay = 0
}: {
  text: string;
  type?: 'success' | 'error' | null;
  ok?: string;
  cancel?: string;
  hideDelay?: number;
}, hideDelayArg = hideDelay) {
  const deferred = ((inject('$q') as ng.IQService)).defer();
  const scope = createScope(deferred);

  destroy();
  show(scope, text, type, ok, cancel);

  if (hideDelayArg) {
    hideTimeout = inject('$timeout')(destroy, hideDelayArg);
  }

  return deferred.promise.finally(destroy);
}

export function hideToast() {
  destroy();
}

export function updateText(text: string) {
  if (!instances.length) {
    return;
  }

  const {scope} = last(instances);
  utils.scope.safeApply(scope, () => scope.text = text);
}
