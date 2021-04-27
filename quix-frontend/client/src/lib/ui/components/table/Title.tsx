import React from 'react';

export interface Title {
  entityName: string;
  shouldDisplaySize?: boolean;
  size?: number;
}

export const Title = ({
  entityName,
  shouldDisplaySize = false,
  size = 0,
}: Title) => {
  return (
    <div className="bi-section-header">
      <div className="bi-section-title">
        <span>{entityName} {shouldDisplaySize && <span className='bi-fade-in'>({size})</span>}</span>
      </div>
    </div>
  )
};
