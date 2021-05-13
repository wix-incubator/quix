import React, {useEffect} from 'react';
import _ from 'lodash';
import {IUser} from '@wix/quix-shared';
import {Highlighter} from '../../lib/ui/components/Highlighter';
import {Table} from '../../lib/ui/components/table/Table';
import {useViewState} from '../../services/hooks';
import {usersTableFields} from './users-table-fields';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import Input from '../../lib/ui/components/Input';
import {FilterInitialState, InitialState, EmptyState, ErrorState} from '../../lib/ui/components/states';
import {debounceAsync} from '../../utils';

export interface UsersProps {
  users: IUser[];
  error: {message: string};
  onUserClicked(user: IUser): void;
}

export const CHUNK_SIZE = 100;

const PaginatedTable = makePagination(Table);

const search = debounceAsync((loadMore, { offset, limit, users, emailFilter }) => {
  return new Promise(res => 
    res(users?.filter(user => user.email.includes(emailFilter)).slice(offset, offset + limit) || [])
  );
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
    size: 0,
    totalUsers: 0,
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
      viewState.set('Initial', {users: serverUsers?.slice(0, CHUNK_SIZE) || []});
    }
  },[serverUsers]);

  useEffect(() => {
    if (viewState.get() !== 'Error' && serverUsers?.length >= 0) {
      loadMore(0, CHUNK_SIZE + 1)(res => {
        if (!_.isEqual(res, stateData.users) || viewState.is('Initial') || viewState.is('FilterInitial')) {
          if (res.length > 0) {
            viewState.set('Content', {
              users: res,
              totalUsers: serverUsers.filter(user => user.email.includes(stateData.emailFilter)).length,
            });
          } else {
            viewState.set('Empty', {
              users: [],
              totalUsers: 0,
              size: 0,
            });
          }
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

  const loadMore = (offset: number, limit: number) => {
    return search(null, {
      offset,
      limit,
      users: serverUsers,
      emailFilter: stateData.emailFilter,
    });
  }

  const renderContentState = () => (
    <PaginatedTable
      hookName="users"
      columns={usersTableFields.map(field => ({
        header: field.title,
        render: row => field.filter(undefined, row, 0, highlightQuery(field.name)),
        accessor: field.name,
        className: field.className,
      }))}
      initialData={stateData.users}
      loadMore={loadMore}
      onRowClicked={onUserClicked}
      paginationSize={CHUNK_SIZE}
      tableSize={(size) => viewState.update({ size })}
    />
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
        placeholder="Filter users by email"
        data-hook="users-filter-users-input"
      />
    </div>
  );

  return (
    <div className="bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div className="bi-section-title">
          <span>Users {viewState.min('Empty') && <span className='bi-fade-in'>({stateData.size} / {stateData.totalUsers})</span>}</span>
        </div>
      </div>

      <div className="bi-section-content bi-c-h bi-s-v--x15">
        {viewState.min('Error') && renderFilter()}
        {
          (() => {
            switch(viewState.get()) {
              case 'Initial':
                return <InitialState entityName="users" />;
              case 'Error':
                return <ErrorState errorMessage={error.message} />;
              case 'Empty':
                return <EmptyState />;
              case 'Content':
                return renderContentState();
              case 'FilterInitial':
                return <FilterInitialState entityName="users" />;
              default:
            }
          })()
        }
      </div>
    </div>
  );
}
