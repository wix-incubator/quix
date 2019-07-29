import {values, isUndefined } from 'lodash';
import angular from 'angular';
import {initNgScope, inject, utils} from '../../../core';

const NAVIGATION_KEYS = {
  UP: 38,
  DOWN: 40,
  SELECT: 13,
  PAGEDOWN: 34,
  PAGEUP: 33,
  END: 35,
  HOME: 36
};

function canScroll(element) {
  return element.css('overflow-y') === 'scroll' || element.css('overflow-y') === 'auto';
}

function adjustScroll(scope, element) {
  const {scrollableElement} = scope.vm;
  const item = angular.element(getElements(scope, element)[scope.vm.currentItemIndex]);

  if (item.length) {
    const topPeekHeight = 50;
    const {top} = item.position();

    if (top <= 0 || top + item.outerHeight() >= scrollableElement.innerHeight()) {
      scrollableElement.stop().animate({scrollTop: scrollableElement.scrollTop() + top - topPeekHeight}, 100);
    }
  }
}

function setCurrentItemByIndex(scope, element, index) {
  scope.vm.currentItemIndex = index;

  if (index >= 0) {
    // TODO: review; timeout to give ng-repeat time to do it's magic
    inject('$timeout')(() => {
      const elements = getElements(scope, element);
      if (elements.length !== scope.vm.collection.length) {
        throw new Error('KeyNav: number of elements doesn\'t match collection!');
      }

      scope.keyNavCurrentItem = scope.vm.collection[index];
    });
  } else {
    scope.keyNavCurrentItem = null;
  }
}

function dispatchNavigationEvent(scope: any, key: any) {
  switch (key) {
    case NAVIGATION_KEYS.SELECT:
      scope.actions.selectCurrentItem();
      break;
    default:
      scope.actions.navigate(key);
  }
}

function isItemDisabled(scope, element,index) {
  const elements = getElements(scope, element);
  return !isUndefined(elements.eq(index).attr('disabled'));
}

function setupCollection(scope, element, collection) {
  scope.vm.elements = null;
  scope.vm.collection = collection;

  if (scope.vm.collection.length && scope.options.markFirst) {
    setCurrentItemByIndex(scope, element, 0);
  } else {
    setCurrentItemByIndex(scope, element, -1);
  }
}

function getElements(scope, element) {
  let elements;
  if (scope.vm.elements) {
    elements = scope.vm.elements;
  } else {
    scope.vm.elements = elements = element.find('[key-nav-item]');
  }
  return elements;
}

export default function () {
  return {
    restrict: 'EA',
    scope: {
      biKeyNav: '=',
      keyNavCurrentItem: '=?',
      keyNavOnSelect: '&',
      keyNavOptions: '='
    },
    link: {
      post(scope: ng.IScope, element) {
        initNgScope(scope)
          .withOptions(scope.keyNavOptions, {
            markFirst: false
          }, false)
          .withVM({
            currentItemIndex: null,
            collection: null,
            elements: null,
            $init() {
              this.scrollableElement = canScroll(element) ? element : element.scrollParent();
            }
          })
          .withActions({
            selectItem(index) {
              const item = scope.vm.collection[index];

              if (isUndefined(item) || isItemDisabled(scope, element, index)) {
                return;
              }

              setCurrentItemByIndex(scope, element, index);

              inject('$timeout')(() => scope.keyNavOnSelect({item}));
            },

            selectCurrentItem() {
              scope.actions.selectItem(scope.vm.currentItemIndex);
            },

            navigate(key: any) {
              let index = scope.vm.currentItemIndex;

              switch (key) {
                case NAVIGATION_KEYS.DOWN:
                  // tslint:disable-next-line: restrict-plus-operands
                  index = Math.min(scope.vm.collection.length - 1, index + 1);
                  break;
                case NAVIGATION_KEYS.UP:
                  index = Math.max(0, index - 1);
                  break;
                case NAVIGATION_KEYS.PAGEDOWN:
                  // tslint:disable-next-line: restrict-plus-operands
                  index = Math.min(scope.vm.collection.length - 1, index + 7);
                  break;
                case NAVIGATION_KEYS.PAGEUP:
                  index = Math.max(0, index - 7);
                  break;
                case NAVIGATION_KEYS.HOME:
                  index = 0;
                  break;
                case NAVIGATION_KEYS.END:
                  index = scope.vm.collection.length - 1;
                  break;
                default:
                  return;
              }

              setCurrentItemByIndex(scope, element, index);
              adjustScroll(scope, element);
            }
          });

        utils.dom.onKey(values(NAVIGATION_KEYS), (_, key) => {
          dispatchNavigationEvent(scope, key);
        }, scope);

        scope.$watch('biKeyNav', collection => collection && setupCollection(scope, element, collection));
      }
    }
  };
}
