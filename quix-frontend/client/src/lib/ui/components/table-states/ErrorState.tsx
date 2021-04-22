import React from 'react';

export const ErrorState = ({
  errorMessage,
}) => (
  <div
    className="bi-empty-state bi-fade-in"
    data-hook="users-error"
  >
    <div className="bi-empty-state-icon bi-danger">
      <i className="bi-icon bi-danger">error_outline</i>
    </div>
    <div className="bi-empty-state-header">{errorMessage}</div>
  </div>
);
