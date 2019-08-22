import angular from 'angular';

import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';
import 'angular-dragdrop';
import '../core';
import '../ui';

import scrollMonitor from 'scrollmonitor';
(window as any).scrollMonitor = scrollMonitor;
import 'ap-viewport-watch';

export default angular.module('bi.fileExplorer', ['bi.core', 'bi.ui', 'ngDragDrop', 'angularViewportWatch']);