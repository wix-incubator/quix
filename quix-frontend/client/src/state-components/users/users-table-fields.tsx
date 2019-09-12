import {IUser} from '@wix/quix-shared';
import biRelativeDate from '../../../src/lib/ui/filters/relative-date';
import * as React from 'react';
import {RowConfig} from '../../lib/ui/components/Table';

export const usersTableFields: RowConfig<IUser>[] = [
  {
    name: 'name',
    title: 'user',
    filter(_, user: IUser, index) {
      return (
        <div className="bi-align bi-s-h">
          <img className="quix-user-avatar" src={user.avatar} />
          <span>{user.name}</span>
        </div>
      );
    }
  },
  {
    name: 'email'
  },
  {
    name: 'dateCreated',
    title: 'Join Date',
    filter(_, user: IUser, index) {
      return (
        <span className="bi-text--sm bi-muted">
          {biRelativeDate()(user.dateCreated as any)}
        </span>
      );
    }
  },
  {
    name: 'dateUpdated',
    title: 'Last Login',
    filter(_, user: IUser, index) {
      return (
        <span className="bi-text--sm bi-muted">
          {biRelativeDate()(user.dateUpdated as any)}
        </span>
      );
    }
  }
];
