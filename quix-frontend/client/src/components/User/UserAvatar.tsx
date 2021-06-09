import React from 'react';
import {IUser} from '@wix/quix-shared';

interface Props {
  user: IUser;
}

export const UserAvatar = (props: Props) => {
  return <>
    {props.user.avatar && <img className="quix-user-avatar" src={props.user.avatar}/>}
    {!props.user.avatar && <i className="bi-icon bi-muted">account_circle</i>}
  </>
}