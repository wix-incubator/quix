import React from 'react';

interface PanelProps {
  header?: JSX.Element;
  children: any;
  className?: {
    main?: string;
    header?: string;
    content?: string;
  };
}

export const Panel = ({ header, children, className }: PanelProps) => {
  const _main = className?.main
    ? `bi-s-v--x15 bi-panel bi-grow ${className?.main}`
    : 'bi-s-v--x15 bi-panel bi-grow';

  const _header = className?.header
    ? `bi-panel-header ${className?.header}`
    : 'bi-panel-header';

  const _content = className?.content
    ? `bi-panel-content ${className?.content}`
    : 'bi-panel-content';

  return (
    <div className={_main}>
      {header ? <div className={_header}>{header}</div> : null}
      <div className={_content}>{children}</div>
    </div>
  );
};
