import React, {useEffect} from 'react';
import _ from 'lodash';
import {IUser} from '@wix/quix-shared';
import {Highlighter} from '../../lib/ui/components/Highlighter';
import {SortableTable} from '../../lib/ui/components/SortableTable';
import {useViewState} from '../../services/hooks';
import {usersTableFields} from './users-table-fields';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import Input from '../../lib/ui/components/Input';
import {FilterInitialState, InitialState, EmptyState, ErrorState} from '../../lib/ui/components/table-states';
import {debounceAsync} from '../../utils';

export interface UsersProps {
  users: IUser[];
  error: {message: string};
  onUserClicked(user: IUser): void;
}

export const CHUNK_SIZE = 100;

const Table = makePagination(SortableTable);

const search = debounceAsync((loadMore, { users, emailFilter }) => {
  return new Promise(res => {
    res(users?.filter(user => user.email.includes(emailFilter)) || [])
  });
});

const States = [
  'Initial',
  'Error',
  'Empty',
  'Content',
  'FilterInitial',
];

export function Users(props: UsersProps) {
  const {users: serverUsers, error, onUserClicked} = props;
  const [stateData, viewState] = useViewState(States, {
    users: [],
    rows: [],
    size: 0,
    emailFilter: '',
    errorMessage: '',
  });

  useEffect(() => {
    if (error) {
      viewState.set('Error', { errorMessage: error.message });
    }
  }, [error]);

  useEffect(() => {
    if (!error) {
      viewState.set('Initial', {users: serverUsers});
    }
  },[serverUsers]);

  useEffect(() => {
    if (viewState.get() !== 'Error') {
      getChunk(0, CHUNK_SIZE + 1)(res => {
        if (!_.isEqual(res, stateData.users) || viewState.is('Initial')) {
          viewState.set(res.length > 0 ? 'Content' : 'Empty', {users: res});
        } else if (stateData.users?.length > 0 && !viewState.is('Content')) {
          viewState.set('Content');
        }
      });
    }
  }, [stateData.emailFilter, stateData.users]);

  const highlightQuery = (columnName: string) => (term: string) => {
    const text = term.replace(/\s+/g,' ');
    
    if (columnName === 'email') {
      return <Highlighter
        term={term}
        filter={stateData.emailFilter}
      />;
    }

    return text;
  }

  const getChunk = (offset: number, limit: number) => {
    return search(null, {
      users: serverUsers,
      emailFilter: stateData.emailFilter,
    });
  }

  const renderContentState = () => (
      <div className="bi-section-content bi-c-h">
        <div
          className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
          data-hook="table-users-content"
        >
          <div className="bi-panel-content bi-c-h">
            <Table
              columns={usersTableFields.map(field => ({
                header: field.title,
                renderRow: row => field.filter(undefined, row, 0, highlightQuery(field.name)),
                accessor: field.name,
                className: field.className,
              }))}
              initialData={stateData.users}
              loadMore={getChunk}
              onRowClicked={onUserClicked}
              paginationSize={stateData.users.length}
              tableSize={(size) => viewState.update({ size })}
            />
          </div>
        </div>
      </div>
  );

  const handleEmailFilterChange = (e) => {
    if (viewState.get() !== 'Error') {
      viewState.set('FilterInitial', { emailFilter: e.target.value });
    }
  }

  const renderFilter = () => (
    <div>
      <Input
        disableUnderline
        onChange={handleEmailFilterChange}
        placeholder="Filter users"
        data-hook="users-filter-query-input"
      />
    </div>
  );

  return (
    <div className="bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div className="bi-section-title">
          <span>Users {viewState.min('Empty') && <span className='bi-fade-in'>({stateData.size})</span>}</span>
        </div>
      </div>

      <div className="bi-section-content bi-c-h bi-s-v--x15">
        {!viewState.is('Error') && renderFilter()}
        {
          (() => {
            switch(viewState.get()) {
              case 'Initial':
                return <InitialState entityName={'users'}/>;
              case 'Error':
                return <ErrorState errorMessage={error.message} />;
              case 'Empty':
                return <EmptyState />;
              case 'Content':
                return renderContentState();
              case 'FilterInitial':
                return <FilterInitialState entityName={'users'} />;
              default:
            }
          })()
        }
      </div>
    </div>
  );
}
