import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';
import { isNil } from 'lodash'
import { useOutsideAlerter } from '../../../../services/hooks';

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
    list?: {
      onClick?: boolean;
    };
  }
}

const createDropdownHelperIfNotExist = () => {
  if (!document.querySelector('.bi-dropdown-helper')) {
    const element = document.createElement('div');
    element.className = 'bi-dropdown-helper';
    document.body.appendChild(element);
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
  createDropdownHelperIfNotExist();
  const isOpenDefined = !isNil(isOpen);

  const [_isOpen, setIsOpen] = useState(false);
  const referenceToggle = useRef(null);
  const referenceOptions = useRef(null);

  const { styles, attributes, forceUpdate } = usePopper(referenceToggle.current, referenceOptions.current, {
    placement: placement || 'bottom-start',
    strategy: 'fixed',
  });
  useOutsideAlerter([referenceToggle, referenceOptions], () => {
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
          onClick={() => setIsOpen(isNil(states?.list?.onClick) ? false : states?.list?.onClick)}
          >
          {
            (isOpenDefined ? isOpen : _isOpen) ?
              children(options)
              : null
          }
        </div>,
          document.querySelector('.bi-dropdown-helper') as any,
        )
      }
    </>
  );
};
