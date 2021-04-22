import React from 'react';

export const InitialState = ({
  entityName,
}) => (
  <div className="bi-empty-state--loading bi-align bi-center bi-grow bi-fade-in">
    <div className="bi-empty-state-content" data-hook="table-initial">Loading {entityName}...</div>
  </div>
);
