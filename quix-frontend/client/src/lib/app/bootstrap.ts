import jQuery from 'jquery';
window.jQuery = jQuery;
window.$ = jQuery;

import angular from 'angular';

import 'angular-resource';
import 'angular-ui-router';

import '../core';
import '../ui';

export const ngApp = angular.module('bi.app', [
  'ngResource',
  'bi.core',
  'bi.ui',
  'ui.router'
]);
