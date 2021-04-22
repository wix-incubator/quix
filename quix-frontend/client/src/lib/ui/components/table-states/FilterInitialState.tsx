import React from 'react';

export const FilterInitialState = ({
  entityName,
}) => (
  <div className="bi-c-h bi-align bi-center bi-grow">
    <div className="bi-empty-state--loading bi-fade-in">
      <div className="bi-empty-state-content" data-hook="table-filter-initial">Searching {entityName}...</div>
    </div>
  </div>
);