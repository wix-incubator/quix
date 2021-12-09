import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';

interface InjectedDropdownProps {
  options: JSX.Element[];
}

export const Dropdown = (
  Element: JSX.Element,
  OptionsWrapper: React.ComponentType<InjectedDropdownProps>,
  options: JSX.Element[],
  isOpen: boolean,
  spanClass?: string,
  placement?: Placement,
) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [referenceOptions, setReferenceOptions] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, referenceOptions, {
    placement: placement || 'bottom-start',
    strategy: 'fixed',
  });

  return (
    <>
      <span className={spanClass || ''} ref={setReferenceElement as any}>
        {Element}
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
