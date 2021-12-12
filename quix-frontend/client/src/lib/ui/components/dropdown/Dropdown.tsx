import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';

interface DropdownProps {
  element: JSX.Element,
  OptionsWrapper: React.ComponentType<InjectedDropdownProps>,
  options: JSX.Element[],
  isOpen: boolean,
  spanClass?: string,
  placement?: Placement,
}

interface InjectedDropdownProps {
  options: JSX.Element[],
}

export const Dropdown = ({
  element,
  OptionsWrapper,
  options,
  isOpen,
  spanClass,
  placement,
}: DropdownProps) => {
  const [_referenceElement, setReferenceElement] = useState(null);
  const [referenceOptions, setReferenceOptions] = useState(null);
  const { styles, attributes } = usePopper(_referenceElement, referenceOptions, {
    placement: placement || 'bottom-start',
    strategy: 'fixed',
  });

  return (
    <>
      <span className={spanClass || ''} ref={setReferenceElement as any}>
        {element}
      </span>
      {isOpen
        ? ReactDOM.createPortal(
            <div
              style={styles.popper}
              {...attributes.popper}
              ref={setReferenceOptions as any}
            >
              <OptionsWrapper options={options} />
            </div>,
            document.querySelector('body') as any,
          )
        : null}
    </>
  );
};
