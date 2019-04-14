import angular from 'angular';
import 'angular-sanitize';
import 'angular-svg-round-progressbar';

import init from './init';
import './app.scss';

init(angular.module('bi.ui', [
  'ngSanitize',
  'bi.core',
  'angular-svg-round-progressbar'
]));

export * from './services';
