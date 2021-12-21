import React from 'react';
import './input.scss';

interface InputProps
  extends Partial<React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >> {
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
  disableFreeWrite?: boolean;
  readonly?: boolean;
}

export const Input = React.forwardRef(({
  className,
  startAdornment,
  endAdornment,
  disableFreeWrite,
  readonly,
  ...p
}: InputProps, ref) => {
  const _readonly = disableFreeWrite || readonly;
  const additionalClasses = `${readonly ? ' bi-disabled' : ''}${className ? ` ${className}` : ''}`

  if (startAdornment || endAdornment) {
    const _wrapperClassName = 'bi-input bi-input-wrapper bi-align' + additionalClasses;

    return (
      <div
        ref={ref as any}
        className={_wrapperClassName}
      >
        {startAdornment}
        <input
          readOnly={_readonly}
          className={`bi-grow bi-input-no-border${
            readonly ? ' bi-disabled' : ''
          }`}
          {...p}
        />
        {endAdornment}
      </div>
    );
  }

  const _className = 'bi-input' + additionalClasses;
  return <input ref={ref as any} readOnly={_readonly} className={_className} {...p} />;
});
