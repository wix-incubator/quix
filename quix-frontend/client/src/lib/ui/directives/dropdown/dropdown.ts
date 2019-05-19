import {initNgScope, inject, utils} from '../../../core';

import './dropdown.scss';
import template from './dropdown.html';

const {onKey, onBlur} = utils.dom;
let instances = [];

function show(scope, element) {
  instances = instances.filter(instance => {
    instance.hide();
    return false;
  });

  instances.push({hide: () => scope.actions.hide(true)});

  scope.vm.toggleEnabled(true);

  return inject('$timeout')(() => {
    const content = element.find('.bd-content');
    let {position} = scope.options;
    const {align} = scope.options;

    let {top, left, right} = element.offset();
    let width = 'auto';
    let minWidth = 'auto';

    if (top + element.height() + content.height() > window.innerHeight) {
      position = 'top';
    }

    // if (left + element.width() + content.width() > window.innerWidth) {
    //   align = 'right';
    // }

    switch (align) {
      case 'right':
        right = document.body.clientWidth - (left + element.width()) as any;
        left = 'initial';
        break;
      case 'center':
        left += ((element.width() - content.width()) / 2);
        right = 'initial';
        break;
      default:
        right = 'initial';
    }

    switch (position) {
      case 'top':
        // tslint:disable-next-line: restrict-plus-operands
        top -= content.height();
        break;
      case 'right':
        left += element.width();
        break;
      default:
        top += element.height();
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
      top,
      left,
      right,
      bottom: 'initial',
      width,
      minWidth
    });

    element.removeClass(['top', 'bottom', 'left', 'right'].map(pos => `bd-position--${pos}`).join(' '));
    element.addClass(`bd-position--${position}`);
    element.addClass(`bd-align--${align}`);

    scope.vm.toggleVisible(true);

    scope.onShow();
  });
}

function hide(scope, mute = false) {
  scope.vm.toggle(false);

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
                    if (child && (scope.options.hideOnClick === false || child.closest('[disabled]').length)) {
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
      }
    }
  };
};
