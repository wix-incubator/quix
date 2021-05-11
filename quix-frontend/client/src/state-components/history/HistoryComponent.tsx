import './HistoryComponent.scss';

import React, { useEffect } from 'react';
import { IHistory } from '@wix/quix-shared';
import { historyTableFields } from './history-table-fields';
import { User } from '../../lib/app/services/user';
import { useViewState } from '../../services/hooks';
import { debounceAsync } from '../../utils';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import { Table } from '../../lib/ui/components/table/Table';
import { Highlighter } from '../../lib/ui/components/Highlighter';
import Input from '../../lib/ui/components/Input';
import Select from '../../lib/ui/components/Select';
import { FilterInitialState, InitialState, EmptyState, ErrorState } from '../../lib/ui/components/states';

export interface HistoryProps {
  error: { message: string };
  user: User;
  onHistoryClicked(history: IHistory): void;
  loadMore({ offset, limit, filters }: { offset: number; limit: number; filters: object }): Promise<IHistory[]>;
  getUsers(): User[];
}

export const CHUNK_SIZE = 100;

const PaginatedTable = makePagination(Table);

const search = debounceAsync((loadMore, { offset, limit, filters }) => {
  return loadMore({ offset, limit, filters });
});

const States = [
  'Initial',
  'Error',
  'Empty',
  'Content',
  'FilterInitial',
];

export function History(props: HistoryProps) {
  const { error, onHistoryClicked, loadMore, user, getUsers } = props;
  const [stateData, viewState] = useViewState(States, {
    rows: [],
    size: 0,
    userFilter: user.getEmail(),
    queryFilter: '',
    errorMessage: '',
  });

  const getChunk = (offset: number, limit: number) => {
    return search(loadMore, {
      offset,
      limit,
      filters: {
        user: stateData.userFilter,
        query: stateData.queryFilter
      }
    });
  }

  useEffect(() => {
    if (error) {
      viewState.set('Error', { errorMessage: error.message });
    }
  }, [error]);

  useEffect(() => {
    if (viewState.get() !== 'Error') {
      getChunk(0, CHUNK_SIZE + 1)(res => {
        viewState.set(res.length > 0 ? 'Content' : 'Empty', {rows: res});
      });
    }
  }, [stateData.queryFilter, stateData.userFilter]);

  const highlightQuery = (columnName: string) => (term: string) => {
    const text = term.replace(/\s+/g,' ');
    
    if (columnName === 'query') {
      return <Highlighter
        term={term}
        filter={stateData.queryFilter}
      />;
    }

    return text;
  }

  const handleUserFilterChange = (option) => {
    if (viewState.get() !== 'Error') {
      viewState.set('FilterInitial', { userFilter: option.id });
    }
  }

  const handleQueryFilterChange = (e) => {
    if (viewState.get() !== 'Error') {
      viewState.set('FilterInitial', { queryFilter: e.target.value });
    }
  }

  const renderContentState = () => (
    <PaginatedTable
      hookName="history"
      initialData={stateData.rows}
      loadMore={getChunk}
      onRowClicked={onHistoryClicked}
      columns={historyTableFields.map(field => ({
        header: field.title,
        render: row => field.filter(undefined, row, 0, highlightQuery(field.name)),
        accessor: field.name,
        className: field.className,
      }))}
      paginationSize={CHUNK_SIZE}
      tableSize={(size) => viewState.update({ size })}
    />
  );

  const renderFilters = () => (
    <div className="hc-filters bi-theme--lighter bi-align bi-s-h--x15">
      <Select
        Highlighter={Highlighter}
        defaultLabel={user}
        options={getUsers}
        title="email"
        primaryLabel="All users"
        onOptionChange={handleUserFilterChange}
        inputDataHook="history-filter-user-select"
        liDataHook="history-filter-user-select-option"
      />

      <Input
        fullWidth={true}
        disableUnderline
        onChange={handleQueryFilterChange}
        placeholder="Filter query"
        data-hook="history-filter-query-input"
      />
    </div>
  );

  return (
    <div className="history-component bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div className="bi-section-title">
          <span>History {viewState.min('Empty') && <span className='bi-fade-in'>({stateData.size})</span>}</span>
        </div>
      </div>

      <div className="bi-section-content bi-c-h bi-s-v--x15">
        {viewState.min('Error') && renderFilters()}

        {
          (() => {
            switch(viewState.get()) {
              case 'Initial':
                return <InitialState entityName="history" />;
              case 'Error':
                return <ErrorState errorMessage={error.message} />;
              case 'Empty':
                return <EmptyState />;
              case 'Content':
                return renderContentState();
              case 'FilterInitial':
                return <FilterInitialState entityName="history" />;
              default:
            }
          })()
        }
      </div>
    </div>
  );
}
