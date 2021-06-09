import React from 'react';
import {IUser} from '@wix/quix-shared';
import {UserAvatar} from './UserAvatar';

interface Props {
  user: IUser;
}

export const UserAvatarAndName = (props: Props) => {
  return <div className="bi-align bi-s-h">
    <UserAvatar user={props.user}></UserAvatar>
    <span>{props.user.name}</span>
  </div>
}