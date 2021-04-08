import './HistoryComponent.scss';

import React, { useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IHistory } from '@wix/quix-shared';
import { historyTableFields } from './history-table-fields';
import { User } from '../../lib/app/services/user';
import { useViewState } from '../../services/hooks';
import { highlightText } from '../../services/search';
import { debounceAsync } from '../../utils';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import { SortableTable } from '../../lib/ui/components/SortableTable';
import Input from '../../lib/ui/components/Input';
import Select from '../../lib/ui/components/Select';
import noResultsImg from '../../../src/assets/no_data.svg';

export interface HistoryProps {
  error: { message: string };
  user: User;
  onHistoryClicked(history: IHistory): void;
  loadMore({ offset, limit, filters }: { offset: number; limit: number; filters: object }): Promise<IHistory[]>;
  getUsers(): User[];
}

export const CHUNK_SIZE = 100;

const Table = makePagination(SortableTable);

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
      return (highlight(term, stateData.queryFilter));
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

  const renderInitialState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state--loading bi-fade-in">
        <div className="bi-empty-state-content" data-hook='history-initial'>Loading query history...</div>
      </div>
    </div>
  );

  const renderFilterInitialState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state--loading bi-fade-in">
        <div className="bi-empty-state-content" data-hook='history-initial'>Searching query history...</div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state bi-fade-in">
        <div className="bi-empty-state-icon bi-danger">
          <i className="bi-icon bi-danger">error_outline</i>
        </div>
        <div className="bi-empty-state-header" data-hook='history-error'>{stateData.errorMessage}</div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state bi-fade-in">
        <img className="bi-empty-state-image" src={noResultsImg}></img>
        <div className="bi-empty-state-header" data-hook='history-result'>No results</div>
      </div>
    </div>
  );

  const renderContentState = () => (
    <div
      className='bi-panel bi-c-h bi-fade-in bi-theme--lighter'
      data-hook='history-content'
    >
      <div className='bi-panel-content bi-c-h'>
        <Table
          initialData={stateData.rows}
          loadMore={getChunk}
          onRowClicked={onHistoryClicked}
          columns={historyTableFields.map(field => ({
            Header: field.title,
            Cell: table => field.filter(undefined, table.row.original, 0, highlightQuery(field.name)),
            accessor: field.name,
            className: field.className,
          }))}
          paginationSize={CHUNK_SIZE}
          tableSize={(size) => viewState.update({ size })}
        />
      </div>
    </div>
  );

  const renderFilter = () => (
    <div className="hc-filters bi-theme--lighter bi-align bi-space-h--x15 bi-fade-in">
      <Select
        highlight={highlight}
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
