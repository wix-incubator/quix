import * as React from 'react';
import {IFile} from '@wix/quix-shared';
import {RowConfig} from '../../lib/ui/components/Table';
import classNames from 'classnames';

export const favoritesTableFields = (onLikeToggle): RowConfig<IFile>[] => [
  {
    name: 'name',
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
    name: 'owner',
    filter(_, file: IFile) {
      return (
        <div className="bi-align bi-s-h">
          <img className="quix-user-avatar" src={file.ownerDetails.avatar} />
          <span>{file.ownerDetails.name}</span>
        </div>
      );
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
