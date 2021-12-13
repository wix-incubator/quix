import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';
import { isNil } from 'lodash'
import { withOutsideClick } from '../../../../services/hooks';

interface DropdownProps {
  toggle(props: any): JSX.Element;
  options: any[],
  isOpen?: boolean,
  placement?: Placement,
  children?(options: any[]): JSX.Element;
  states?: {
    toggle?: {
      onClick?: boolean;
      onKeyDown?: boolean;
      onFocus?: boolean;
    };
  }
}

export const Dropdown = ({
  toggle,
  options,
  isOpen,
  placement,
  children,
  states,
}: DropdownProps) => {
  const isOpenDefined = !isNil(isOpen);

  const [_isOpen, setIsOpen] = useState(false);
  const referenceToggle = useRef(null);
  const referenceOptions = useRef(null);

  const { styles, attributes, forceUpdate } = usePopper(referenceToggle.current, referenceOptions.current, {
    placement: placement || 'bottom-start',
    strategy: 'fixed',
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
              <div className="bi-fade-in">
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
