import * as React from 'react';
import {IUser} from '@wix/quix-shared';
import biRelativeDate from '../../../src/lib/ui/filters/relative-date';
import { HighlightedRowConfig } from '../../lib/ui/components/table/TableRow';

export const usersTableFields: HighlightedRowConfig<IUser>[] = [
  {
    name: 'name',
    title: 'User',
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
    name: 'email',
    title: 'Email',
    filter(_, user: IUser, index, highlight) {
      return (
        <div className="bi-align bi-s-h">
          <span>{highlight(user.email)}</span>
        </div>
      );
    }
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
