import * as React from 'react';
import { IDeletedNotebook } from '@wix/quix-shared';
import { RowConfig } from '../../lib/ui/components/table/TableRow';
import relativeDate from '../../lib/ui/filters/relative-date';
import absoluteDate from '../../lib/ui/filters/absolute-date';

export const trashBinTableFields = (
  onPermanentlyDeleteClicked,
  onRestoreClicked
): RowConfig<IDeletedNotebook>[] => {
  return [
    {
      name: 'name',
      title: 'Name',
      filter(_, deletedNotebook: IDeletedNotebook) {
        return (
          <div className='bi-align bi-s-h'>
            <i className='bi-icon bi-muted'>insert_drive_file</i>
            <span>{deletedNotebook.name}</span>
          </div>
        );
      },
    },
    {
      name: 'dateDeleted',
      title: 'Date Deleted',
      filter(_, deletedNotebook: IDeletedNotebook) {
        return (
          <div className='bi-align bi-s-h--x05 bi-text--sm bi-muted'>
            <span>{relativeDate()(deletedNotebook.dateDeleted as any)}</span>
            <span>({absoluteDate()(deletedNotebook.dateDeleted as any)})</span>
          </div>
        );
      },
    },
    {
      name: '' as any,
      title: '',
      filter(_, deletedNotebook: IDeletedNotebook) {
        return (
          <div className='bi-justify-right bi-align bi-s-h'>
            <button
              className='bi-button--success bi-button--sm bi-s-h'
              title='Restore Notebook to Folder'
              onClick={(e) => {
                e.stopPropagation();
                onRestoreClicked(deletedNotebook);
              }}
            >
              <i className='bi-icon--xs'>replay</i>
              <span>Restore</span>
            </button>
            <button
              className='bi-button--danger bi-button--sm bi-s-h'
              title='Permanently Delete Notebook'
              onClick={(e) => {
                e.stopPropagation();
                onPermanentlyDeleteClicked(deletedNotebook);
              }}
            >
              <i className='bi-icon--xs'>delete_forever</i>
              <span>Delete</span>
            </button>
          </div>
        );
      },
    },
  ];
};
