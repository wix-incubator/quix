import angular from 'angular';
import 'jquery-ui/ui/widgets/sortable';
import 'angular-ui-sortable';

import ace from 'brace';

import {setupAce} from './ace-extensions';
setupAce(ace);

import 'brace/theme/tomorrow';
import '../core';
import '../ui';

export default angular.module('bi.codeEditor', ['bi.core', 'bi.ui', 'ui.sortable']);
