import React from 'react';

export const ErrorState = ({
  errorMessage,
}) => (
  <div
    className="bi-empty-state bi-align bi-center bi-grow bi-fade-in"
    data-hook="table-error"
  >
    <div className="bi-empty-state-icon bi-danger">
      <i className="bi-icon bi-danger">error_outline</i>
    </div>
    <div className="bi-empty-state-header">{errorMessage}</div>
  </div>
);
