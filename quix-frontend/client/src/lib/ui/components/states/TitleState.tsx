import React from 'react';

export interface TitleStateProps {
  entityName: string;
  size?: number;
}

export const TitleState = ({
  entityName,
  size,
}: TitleStateProps) => {
  return (
    <div className="bi-section-header">
      <div className="bi-section-title">
        <span>{entityName} {!size || <span className='bi-fade-in'>({size})</span>}</span>
      </div>
    </div>
  )
};
