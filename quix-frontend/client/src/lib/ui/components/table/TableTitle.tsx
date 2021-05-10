import React from 'react';

export interface TableTitle {
  entityName: string;
  shouldDisplaySize?: boolean;
  size?: number;
}

export const TableTitle = ({
  entityName,
  shouldDisplaySize = false,
  size = 0,
}: TableTitle) => {
  return (
    <div className="bi-section-header">
      <div className="bi-section-title">
        <span>{entityName} {shouldDisplaySize && <span className='bi-fade-in'>({size})</span>}</span>
      </div>
    </div>
  )
};
