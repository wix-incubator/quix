import React from 'react';
import './input.scss';

interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
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

  if (startAdornment || endAdornment) {
    const _wrapperClassName = `bi-input bi-input-wrapper bi-align bi-space-h${
      readonly ? ' bi-disabled' : ''
    }${className ? ` ${className}` : ''}`;

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

  const _className = className
    ? `bi-input ${readonly ? 'bi-disabled' : ''}${className}`
    : 'bi-input';
  return <input ref={ref as any} readOnly={_readonly} className={_className} {...p} />;
});
