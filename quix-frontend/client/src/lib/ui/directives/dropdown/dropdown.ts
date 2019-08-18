import {initNgScope, inject, utils} from '../../../core';
import Popper from 'popper.js';

import './dropdown.scss';
import template from './dropdown.html';

const {onKey, onBlur} = utils.dom;
let instances = [];

function setClasses(element, popperActualPlacement) {
  const [position_, align_] = popperActualPlacement.split('-');
  let parsedAlign = '';
  if (!align_) {
    parsedAlign = 'center';
  }
  else if (align_ === 'start') {
    parsedAlign = 'left';
  } else {
    parsedAlign = 'right'
  }
  element.removeClass(['top', 'bottom', 'left', 'right'].map(pos => `bd-position--${pos}`).join(' '));
  element.addClass(`bd-position--${position_}`);
  element.addClass(`bd-align--${parsedAlign}`);
}

function show(scope, element) {
  if (scope.options.hideOthers) {
    instances = instances.filter(instance => {
      instance.hide();
      return false;
    });
  }


  instances.push({hide: () => scope.actions.hide(true)});

  scope.vm.toggleEnabled(true);
  const timeout = inject('$timeout')
  return timeout(() => timeout(() => {
    const content = element.find('.bd-content');
    const {position, align} = scope.options;

    let width = 'auto';
    let minWidth = 'auto';

    let popperPlacement = position;
    switch (align) {
      case 'left':
        popperPlacement += '-start'
        break;
      case 'center':
        break;
      case 'right':
        popperPlacement += '-end';
        break;
      default:
    }
    if (!scope.popper) {
      scope.popper = new Popper(element.get(0), content.get(0), {
        placement: popperPlacement,
        positionFixed: true,
        modifiers: {
          preventOverflow: {
            boundariesElement: 'viewport',
            priority: ['bottom', 'top']
          }
        },
        onCreate(data) {
          setClasses(element, data.placement)
        },
        onUpdate(data) {
          setClasses(element, data.placement)
        }
      });
    }

    switch (scope.options.minWidth) {
      case 'toggle':
        minWidth = element.width();
        break;
      default:
    }

    if (!scope.options.minWidth) {
      switch (scope.options.width) {
        case 'toggle':
          width = element.width();
          break;
        default:
      }
    }

    content.css({
      width,
      minWidth
    });

    scope.vm.toggle(true);

    scope.onShow();
  }))
}


function hide(scope, mute = false) {
  scope.vm.toggle(false);

  if (scope.popper) {
    scope.popper.destroy();
    scope.popper = null;
  }

  if (!mute) {
    scope.onHide();
  }
}

export default () => {
  return {
    restrict: 'E',
    template,
    transclude: {
      toggle: 'biToggle'
    },
    scope: {
      bdIsOpen: '=?',
      bdOptions: '<',
      onShow: '&',
      onHide: '&',
      readonly: '='
    },

    link: {
      pre(scope, element, attrs) {
        let cleaners = [];
        let timeoutPromise;
        const timeout = inject('$timeout');

        initNgScope(scope)
          .readonly(scope.readonly)
          .withOptions('bdOptions', {
            align: 'left',      /* left|right|center */
            position: 'bottom', /* bottom|top|right|left */
            width: 'content',   /* content|toggle */
            minWidth: null,     /* content|toggle */
            toggleOn: 'click',  /* click|hover|manual */
            hideOn: 'hover',    /* click|hover */
            hideOnClick: true,
            hideOthers: true,
            delay: {
              show: 0
            },
            caret: false
          })
          .withVM({
            $init() {
              const toggle = this.toggle.bind(this);
              this.toggle = enabled => {
                toggle(enabled);

                inject('$timeout')(() => scope.bdIsOpen = this.enabled);

                return this.enabled;
              };
            }
          })
          .withEditableActions({
            toggle(enabled) {
              if (typeof enabled === 'undefined') {
                enabled = scope.vm.enabled;
              } else {
                enabled = !enabled;
              }

              if (enabled) {
                scope.actions.hide();
              } else {
                scope.actions.show();
              }
            },
            show() {
              timeoutPromise = inject('$timeout')(() => show(scope, element).then(() => {
                cleaners = [
                  onKey('escape', (off) => {
                    scope.actions.hide();
                    off();
                  }, scope),

                  onBlur(element, (off, child) => {
                    if (
                      child &&
                      (
                        scope.options.hideOnClick === false ||
                        child.closest('bi-toggle').length ||
                        child.closest('[disabled]').length
                      )
                    ) {
                      return false;
                    }

                    scope.actions.hide();
                    off();
                  }, scope)
                ];
              }), scope.options.delay.show);
            },
            hide(mute = false) {
              timeout.cancel(timeoutPromise);
              cleaners.forEach(cleaner => cleaner());
              hide(scope, mute);
            }
          });

        scope.$watch('bdIsOpen', (isOpen, prev) => {
          if (isOpen !== prev && isOpen !== scope.vm.enabled) {
            scope.actions.toggle(isOpen);
          }
        });
        scope.$on('$destroy', () => {
          if (scope.popper) {
            scope.popper.destroy();
            scope.popper = null;
          }
        });
      }
    }
  };
};
