import React from 'react';

export const InitialState = ({
  entityName,
}) => (
  <div className="bi-empty-state--loading bi-fade-in">
    <div className="bi-empty-state-content" data-hook="initial">Loading {entityName}...</div>
  </div>
);
