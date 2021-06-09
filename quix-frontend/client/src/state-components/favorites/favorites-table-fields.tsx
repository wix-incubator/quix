import * as React from 'react';
import {IFile} from '@wix/quix-shared';
import {RowConfig} from '../../lib/ui/components/table/TableRow';
import classNames from 'classnames';
import { UserAvatarAndName } from '../../components/User/UserAvatarAndName';

export const favoritesTableFields = (onLikeToggle): RowConfig<IFile>[] => [
  {
    name: 'name',
    title: 'Name',
    filter(_, file: IFile) {
      return (
        <div className="bi-align bi-s-h">
          <i className="bi-icon bi-muted">insert_drive_file</i>
          <span>{file.name}</span>
        </div>
      );
    }
  },
  {
    name: 'ownerDetails',
    title: 'User',
    filter(_, file: IFile) {
      return <UserAvatarAndName user={file.ownerDetails}></UserAvatarAndName>;
    }
  },
  {
    name: 'isLiked',
    title: ' ',
    filter(_, file: IFile) {
      return (
        <div className="bi-justify-right">
          <i
            className={classNames(
              {'bi-danger': file.isLiked},
              'bi-action',
              'bi-icon--sm'
            )}
            onClick={e => {
              e.stopPropagation();
              onLikeToggle(file);
            }}
          >
            {file.isLiked ? 'favorite' : 'favorite_border'}
          </i>
        </div>
      );
    }
  }
];
