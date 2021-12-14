import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';
import { isNil } from 'lodash'
import { withOutsideClick } from '../../../../services/hooks';
import './dropdown.scss';

interface DropdownProps {
  toggle(props: any): JSX.Element;
  options: any[];
  isOpen?: boolean;
  placement?: Placement;
  children?(options: any[]): JSX.Element;
  states?: {
    toggle?: {
      onClick?: boolean;
      onKeyDown?: boolean;
      onFocus?: boolean;
    };
  };
  dynamicWidth?: boolean;
}

const sameWidth = {
  name: 'sameWidth',
  enabled: true,
  phase: 'beforeWrite' as any,
  requires: ['computeStyles'],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${
      state.elements.reference.offsetWidth
    }px`;
  }
};

export const Dropdown = ({
  toggle,
  options,
  isOpen,
  placement,
  children,
  states,
  dynamicWidth = true,
}: DropdownProps) => {
  const isOpenDefined = !isNil(isOpen);

  const [_isOpen, setIsOpen] = useState(false);
  const referenceToggle = useRef(null);
  const referenceOptions = useRef(null);

  const { styles, attributes, forceUpdate } = usePopper(referenceToggle.current, referenceOptions.current, {
    placement: placement || 'bottom-start',
    strategy: 'fixed',
    modifiers: dynamicWidth ? [sameWidth] : [],
  });
  withOutsideClick([referenceToggle], () => {
    forceUpdate();
    setIsOpen(false);
  });

  return (
    <>
      {
        toggle({
          ref: referenceToggle,
          onClick:() => setIsOpen(isNil(states?.toggle?.onClick) ? !_isOpen : states?.toggle?.onClick),
          onKeyDown:() => setIsOpen(isNil(states?.toggle?.onKeyDown) ? true : states?.toggle?.onKeyDown),
          onFocus:() => setIsOpen(isNil(states?.toggle?.onFocus) ? true : states?.toggle?.onFocus),
        })
      }
      {
        ReactDOM.createPortal(
        <div
          style={styles.popper}
          {...attributes.popper}
          ref={referenceOptions}
          >
          {
            (isOpenDefined ? isOpen : _isOpen) ?
              <div className="bi-fade-in bi-theme--lighter bi-dropdown-content">
                {children(options)}
              </div>
              : null
          }
        </div>,
          document.querySelector('body') as any,
        )
      }
    </>
  );
};
