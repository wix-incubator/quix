import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';

interface DropdownProps {
  ReferenceElement: JSX.Element,
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
  ReferenceElement,
  OptionsWrapper,
  options,
  isOpen,
  spanClass,
  placement,
}: DropdownProps) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [referenceOptions, setReferenceOptions] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, referenceOptions, {
    placement: placement || 'bottom-start',
    strategy: 'fixed',
  });

  return (
    <>
      <span className={spanClass || ''} ref={setReferenceElement as any}>
        {ReferenceElement}
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
