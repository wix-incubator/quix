import angular from 'angular';
import {inject, utils} from '../../core';

import './toast.scss';

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

function show(scope, text, okText, cancelText) {
  scope.text = text;
  scope.okText = okText;
  scope.cancelText = cancelText;

  const toast = angular.element(`
    <div class="bi-toast bi-space-h--x3 bi-fade-in">
      <span class="bi-toast-text">{{text}}</span>

      <span class="bi-space-h">
        <span class="bi-action bi-label" ng-if="okText" ng-click="ok()">{{::okText}}</span>
        <span class="bi-action bi-label" ng-if="cancelText" ng-click="cancel()">{{::cancelText}}</span>
      </span>
    </div>
  `);

  const element = inject('$compile')(toast)(scope);
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

export function showToast({text, ok = '', cancel = '', hideDelay = 0}) {
  const deferred = ((inject('$q') as ng.IQService)).defer();
  const scope = createScope(deferred);

  destroy();
  show(scope, text, ok, cancel);

  if (hideDelay) {
    hideTimeout = inject('$timeout')(destroy, hideDelay);
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

  const {scope} = _.last(instances);
  utils.scope.safeApply(scope, () => scope.text = text);
}
