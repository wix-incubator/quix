import * as React from 'react';
import { IDeletedNotebook } from '@wix/quix-shared';
import { RowConfig } from '../../lib/ui/components/table/TableRow';
import classNames from 'classnames';

export const trashBinTableFields = (onPermanentlyDeleteClicked, onRestoreClicked): RowConfig<IDeletedNotebook>[] => [
  {
    name: 'name',
    title: 'Name',
    filter(_, deletedNotebook: IDeletedNotebook) {
      return (
        <div className="bi-align bi-s-h">
          <i className="bi-icon bi-muted">insert_drive_file</i>
          <span>{deletedNotebook.name}</span>
        </div>
      );
    }
  },
  //TODO Restore
  {
    

    name: 'Delete' as any,
    title: 'Delete',
    filter(_, deletedNotebook: IDeletedNotebook) {
      return (
        <div>
          <i
            className={classNames(
              'bi-action',
              'bi-icon'
            )}
            onClick={e => {
              e.stopPropagation();
              onPermanentlyDeleteClicked(deletedNotebook);
            }}
          >delete
          </i>
        </div>
      );
    }
  } 
];
