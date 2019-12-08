import * as React from 'react';
import {IUser} from '@wix/quix-shared';
import {Table} from '../../lib/ui/components/Table';
import {usersTableFields} from './users-table-fields';

export interface UsersProps {
  users: IUser[];
  error: {message: string};
  onUserClicked(user: IUser): void;
}

export function Users(props: UsersProps) {
  const {users, error, onUserClicked} = props;

  const displayLoadingState = () => (
    <div className="bi-empty-state--loading bi-fade-in">
      <div className="bi-empty-state-content">Loading users...</div>
    </div>
  );

  const displayErrorState = () => (
    <div
      className="bi-empty-state bi-fade-in"
      data-hook="users-error"
    >
      <div className="bi-empty-state-icon bi-danger">
        <i className="bi-icon bi-danger">error_outline</i>
      </div>
      <div className="bi-empty-state-header">{error.message}</div>
    </div>
  );

  const displayLoadedState = () => (
      <div className="bi-section-content bi-c-h">
        <div
          className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
          data-hook="users-content"
        >
          <div className="bi-panel-content bi-c-h">
            <Table
              rows={users}
              rowsConfig={usersTableFields}
              onRowClicked={onUserClicked}
            />
          </div>
        </div>
      </div>
  );
  return (
    <div className="bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div>
          <div className="bi-section-title">
            Users
            {users &&
            <span className="bi-fade-in"> ({users.length})</span>
            }
          </div>
        </div>
      </div>
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
