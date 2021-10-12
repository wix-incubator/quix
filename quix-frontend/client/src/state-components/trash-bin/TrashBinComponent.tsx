import { IDeletedNotebook } from '@wix/quix-shared';
import React, { useEffect } from 'react';
import {
  EmptyState,
  ErrorState,
  InitialState,
} from '../../lib/ui/components/states';
import { Table } from '../../lib/ui/components/table/Table';
import { useViewState } from '../../services/hooks';
import { trashBinTableFields } from './trash-bin-table-fields';

export interface TrashBinProps {
  deletedNotebooks: IDeletedNotebook[];
  error: { message: string };
  onPermanentlyDeleteClicked(deletedNotebook: IDeletedNotebook): void;
  onRestoreClicked(deletedNotebook: IDeletedNotebook, folderId: string);
  onEmptyTrashBinClicked();
}

const States = ['Initial', 'Error', 'Empty', 'Content'];

export const TrashBin = (props: TrashBinProps) => {
  const {
    deletedNotebooks: serverDeletedNotebooks,
    error,
    onPermanentlyDeleteClicked,
    onRestoreClicked,
    onEmptyTrashBinClicked,
  } = props;

  const [stateData, viewState] = useViewState(States, {
    deletedNotebooks: [],
    size: 0,
    totalDeletedNotebooks: 0,
    errorMessage: '',
  });

  useEffect(() => {
    if (error) {
      viewState.set('Error', { errorMessage: error.message });
    }
  }, [error]);

  useEffect(() => {
    if (!error && serverDeletedNotebooks?.length >= 0) {
      viewState.set(serverDeletedNotebooks?.length ? 'Content' : 'Empty', {
        deletedNotebooks: serverDeletedNotebooks || [],
        size: serverDeletedNotebooks.length || 0,
      });
    }
  }, [serverDeletedNotebooks]);

  const renderContentState = () => (
    <Table
      hookName='deleted-notebooks'
      columns={trashBinTableFields(
        onPermanentlyDeleteClicked,
        onRestoreClicked
      ).map((field) => ({
        header: field.title || field.name,
        render: (row) => field.filter(undefined, row),
        accessor: field.name,
        className: field.className,
      }))}
      data={stateData.deletedNotebooks}
      onRowClicked={(row) => {
        
      }}
    />
  );

  return (
    <div className='bi-section bi-c-h bi-grow'>
      <div className='bi-section-header'>
        <div className='bi-section-title'>
          <span>
            Trash Bin{' '}
            {viewState.min('Empty') && (
              <span className='bi-fade-in'>({stateData.size})</span>
            )}
          </span>
        </div>
      </div>
      {viewState.get() === 'Content' && (
        <div className='bi-section-controls bi-fade-in'>
          <button
            className='bi-button--danger'
            onClick={onEmptyTrashBinClicked}
          >
            Empty Trash Bin
          </button>
        </div>
      )}
      <div className='bi-section-content bi-c-h bi-s-v--x15'>
        {(() => {
          switch (viewState.get()) {
            case 'Initial':
              return <InitialState entityName='deleted notebooks' />;
            case 'Error':
              return <ErrorState errorMessage={error.message} />;
            case 'Empty':
              return <EmptyState />;
            case 'Content':
              return renderContentState();
            default:
          }
        })()}
      </div>
    </div>
  );
};
