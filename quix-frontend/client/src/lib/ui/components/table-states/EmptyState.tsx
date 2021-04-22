import React from 'react';
import noResultsImg from '../../../../assets/no_data.svg';

export const EmptyState = () => (
  <div className="bi-c-h bi-align bi-center bi-grow">
    <div className="bi-empty-state bi-fade-in">
      <img className="bi-empty-state-image" src={noResultsImg}></img>
      <div className="bi-empty-state-header" data-hook="users-result">No results</div>
    </div>
  </div>
);
