import * as React from 'react';
import {IUser} from '../../../../shared/dist';
import {UsersTable} from './UsersTable';

export interface UsersProps {
  users: IUser[];
  error: {message: string};
  onUserClicked(user: IUser): void;
}

export function Users(props: UsersProps) {
  const {users, error, onUserClicked} = props;

  const displayLoadingState = () => (
    <div className="quix-empty-state bi-empty-state--loading bi-fade-in">
      <div className="bi-empty-state-content">Loading users...</div>
    </div>
  );

  const displayErrorState = () => (
    <div
      className="quix-empty-state bi-empty-state bi-fade-in"
      data-hook="users-error"
    >
      <div className="bi-empty-state-icon bi-danger">
        <i className="bi-icon bi-danger">error_outline</i>
      </div>
      <div className="bi-empty-state-header">{error.message}</div>
    </div>
  );

  const displayLoadedState = () => (
    <>
      <div className="bi-section-header">
        <div>
          <div className="bi-section-title">
            Users
            <span className="bi-fade-in">({users.length})</span>
          </div>
        </div>
      </div>
      <div className="bi-section-content bi-c-h">
        <div
          className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
          data-hook="users-content"
        >
          <div className="bi-panel-content bi-c-h">
            <UsersTable users={users} onUserClicked={onUserClicked} />
          </div>
        </div>
      </div>
    </>
  );
  return (
    <div className="bi-section bi-c-h bi-grow">
      {!users ? (
        <div className="bi-section-content--center">
          {error ? displayErrorState() : displayLoadingState()}
        </div>
      ) : (
        displayLoadedState()
      )}
    </div>
  );
}
