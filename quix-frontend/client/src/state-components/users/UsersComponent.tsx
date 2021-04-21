import * as React from 'react';
import {IUser} from '@wix/quix-shared';
import Highlighter from 'react-highlight-words';
import _ from 'lodash';
import {SortableTable} from '../../lib/ui/components/SortableTable';
import {highlightText} from '../../services/search';
import {useViewState} from '../../services/hooks';
import {usersTableFields} from './users-table-fields';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import Input from '../../lib/ui/components/Input';
import noResultsImg from '../../../src/assets/no_data.svg';
import { useEffect } from 'react';
import { debounceAsync } from '../../utils';

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
    viewState.set('Initial', {users: serverUsers});
  },[serverUsers]);

  useEffect(() => {
    if (viewState.get() !== 'Error') {
      getChunk(0, CHUNK_SIZE + 1)(res => {
        if (!_.isEqual(res, stateData.users)) {
          viewState.set(res.length > 0 ? 'Content' : 'Empty', {users: res});
        } else if (stateData.users.length > 0 && !viewState.is('Content')) {
          viewState.set('Content');
        }
      });
    }
  }, [stateData.emailFilter, stateData.users]);

  const renderInitialState = () => (
    <div className="bi-empty-state--loading bi-fade-in">
      <div className="bi-empty-state-content">Loading users...</div>
    </div>
  );

  const renderErrorState = () => (
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
    
    if (columnName === 'email') {
      return highlight(term, stateData.emailFilter);
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
              initialData={stateData.users}
              loadMore={getChunk}
              onRowClicked={onUserClicked}
              paginationSize={stateData.users.length}
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
    <div className="hc-filters bi-theme--lighter bi-align bi-s-h--x15">
      <Input
        fullWidth={true}
        disableUnderline
        onChange={handleEmailFilterChange}
        placeholder="Filter users"
        data-hook="users-filter-query-input"
      />
    </div>
  );

  const renderEmptyState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state bi-fade-in">
        <img className="bi-empty-state-image" src={noResultsImg}></img>
        <div className="bi-empty-state-header" data-hook="users-result">No results</div>
      </div>
    </div>
  );

  const renderFilterInitialState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state--loading bi-fade-in">
        <div className="bi-empty-state-content" data-hook="users-initial">Searching users...</div>
      </div>
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
        {viewState.min('Error') && renderFilter()}

        {
          (() => {
            switch(viewState.get()) {
              case 'Initial':
                return renderInitialState();
              case 'Error':
                return renderErrorState();
              case 'Empty':
                return renderEmptyState();
              case 'Content':
                return renderContentState();
              case 'FilterInitial':
                return renderFilterInitialState();
              default:
            }
          })()
        }
      </div>
    </div>
  );
}
