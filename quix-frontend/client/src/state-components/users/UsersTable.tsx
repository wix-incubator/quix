import * as React from 'react';
import {IUser} from '../../../../shared';
import biRelativeDate from '../../../src/lib/ui/filters/relative-date';

export interface UsersTableProps {
  users: IUser[];
  onUserClicked(user: IUser): void;
}

export function UsersTable(props: UsersTableProps) {
  const {users} = props;
  return (
    <div
      className={
        'bi-table-container bi-table--nav bi-c-h bi-grow bi-table-sticky-header'
      }
    >
      <div className={'bi-fade-in'}>
        <table className={'bi-table'}>
          <thead className="bi-tbl-header ng-scope ng-isolate-scope">
            <tr>
              {['User', 'Email', 'Join Date', 'Last Login'].map(fieldName => (
                <th>
                  <div className="bi-table-th-content bi-text--ui">
                    <span className="bi-text--600">{fieldName}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr
                onClick={() => props.onUserClicked(user)}
                data-hook="table-row"
                className="ng-scope ng-isolate-scope"
              >
                <td className="name-column">
                  <div className="bi-align bi-s-h ng-scope">
                    <img className="quix-user-avatar" src={user.avatar} />
                    <span className="ng-binding">{user.name}</span>
                  </div>
                </td>
                <td className="email-column">{user.email}</td>
                <td className="dateCreated-column">
                  <span className="bi-text--sm bi-muted ng-binding ng-scope">
                    {biRelativeDate()(user.dateCreated as any)}
                  </span>
                </td>
                <td className="dateUpdated-column">
                  <span className="bi-text--sm bi-muted ng-binding ng-scope">
                    {biRelativeDate()(user.dateUpdated as any)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
