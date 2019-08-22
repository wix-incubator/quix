import angular from 'angular';

import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';
import 'angular-dragdrop';
import '../core';
import '../ui';

export default angular.module('bi.fileExplorer', ['bi.core', 'bi.ui', 'ngDragDrop']);