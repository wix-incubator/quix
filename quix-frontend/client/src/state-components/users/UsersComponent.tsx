import * as React from 'react';
import {IUser} from '@wix/quix-shared';
import Highlighter from 'react-highlight-words';
import {SortableTable} from '../../lib/ui/components/SortableTable';
import {highlightText} from '../../services/search';
import {useViewState} from '../../services/hooks';
import {usersTableFields} from './users-table-fields';
import makePagination from '../../lib/ui/components/hoc/makePagination';

export interface UsersProps {
  users: IUser[];
  error: {message: string};
  onUserClicked(user: IUser): void;
}

export const CHUNK_SIZE = 100;

const Table = makePagination(SortableTable);

const States = [
  'Initial',
  'Error',
  'Empty',
  'Content',
  'FilterInitial',
];

export function Users(props: UsersProps) {
  const {users, error, onUserClicked} = props;
  const [stateData, viewState] = useViewState(States, {
    rows: [],
    size: 0,
    userFilter: '',
  });

  const displayLoadingState = () => (
    <div className="bi-empty-state--loading bi-fade-in">
      <div className="bi-empty-state-content">Loading users...</div>
    </div>
  );

  const displayErrorState = () => (
    <div
      className="bi-empty-state bi-fade-in"
      data-hook="users-error"
    >
      <div className="bi-empty-state-icon bi-danger">
        <i className="bi-icon bi-danger">error_outline</i>
      </div>
      <div className="bi-empty-state-header">{error.message}</div>
    </div>
  );

  const highlight = (term: string, filter: string) => {
    const highlightProps = highlightText(term, filter);
      
    return (
      <Highlighter
        searchWords={[highlightProps.currentFilter]}
        autoEscape={true}
        textToHighlight={highlightProps.textToHighlight}
      />
    )
  }

  const highlightQuery = (columnName: string) => (term: string) => {
    const text = term.replace(/\s+/g,' ');
    
    if (columnName === 'query') {
      return (highlight(term, stateData.userFilter));
    }

    return text;
  }

  const displayLoadedState = () => (
      <div className="bi-section-content bi-c-h">
        <div
          className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
          data-hook="users-content"
        >
          <div className="bi-panel-content bi-c-h">
            <Table
              columns={usersTableFields.map(field => ({
                Header: field.title,
                Cell: table => field.filter(undefined, table.row.original, 0, highlightQuery(field.name)),
                accessor: field.name,
                className: field.className,
              }))}
              initialData={users}
              loadMore={() => {}}
              onRowClicked={onUserClicked}
              paginationSize={users.length}
            />
          </div>
        </div>
      </div>
  );
  return (
    <div className="bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div>
          <div className="bi-section-title">
            Users
            {users &&
            <span className="bi-fade-in"> ({users.length})</span>
            }
          </div>
        </div>
      </div>
      {!users ? (
        <div className="bi-section-content--center">
          {error ? displayErrorState() : displayLoadingState()}
        </div>
      ) : (
        displayLoadedState()
      )}
    </div>
  );
}
