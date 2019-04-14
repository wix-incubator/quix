import angular from 'angular';
import 'angular-resource';
import 'angular-sanitize';
import 'ng-csv';
import '../ui';
import '../code-editor';
import '../viz';

export default angular.module('bi.runner', [
  'ngResource',
  'ngSanitize',
  'ngCsv',
  'bi.codeEditor',
  'bi.ui',
  'bi.viz'
]);
