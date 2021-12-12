import React, { useEffect, useRef, useState } from 'react';
import { RenderInputProps } from '../autocomplete/autocomplete.hook';
import CaretPositioning from './EditCaretPositioning';

export const SpanEditable = (props: RenderInputProps) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(props.inputValue);
  const [caretPosition, setCaretPosition] = useState(props.inputValue);

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      (mounted as any).current = true;
    } else {
      // componentDidUpdate logic
      props.open &&
        CaretPositioning.restoreSelection(elementRef.current, caretPosition);
    }
  });

  useEffect(() => {
    setValue(props.inputValue);
  }, [props.inputValue]);

  const _handleInput = (event: any) => {
    const savedCaretPosition = CaretPositioning.saveSelection(
      event.currentTarget,
    );
    setCaretPosition(savedCaretPosition);
    props.onValueChange(event.target.innerHTML);
  };

  return (
    <span
      ref={elementRef}
      contentEditable={!props.readonly}
      onInput={_handleInput}
      onBlur={() => props.setIsOpen(false)}
      onFocus={() => {
        props.setIsOpen(true);
        props.onInputFocus && props.onInputFocus();
      }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};
