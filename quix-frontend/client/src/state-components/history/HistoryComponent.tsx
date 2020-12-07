import './HistoryComponent.scss';
import React, { useEffect, useState } from 'react';
import { IHistory } from '@wix/quix-shared';
import _ from 'lodash';
import { SortableTable } from '../../lib/ui/components/SortableTable';
import { historyTableFields } from './history-table-fields';
import {extractTextAroundMatch} from '../../services/search';
import Highlighter from 'react-highlight-words';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import Select from '../../lib/ui/components/Select';
import { User } from '../../lib/app/services/user';
import { useViewState } from '../../services/hooks';
import { debounceAsync } from '../../utils';
import noResultsImg from '../../../src/assets/no_data.svg';
import Input from '../../lib/ui/components/Input';

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
  'Content',
  'Result',
  'Error',
];

export function History(props: HistoryProps) {
  const { error, onHistoryClicked, loadMore, user, getUsers } = props;

  const [initialData, setInitialData] = useState([]);

  const [stateData, viewState] = useViewState(States, {
    size: 0,
    userFilter: user.getEmail(),
    queryFilter: '',
    errorMessage: '',
  });

  useEffect(() => {
    if (error) {
      viewState.set('Error', { errorMessage: error.message });
    }
  }, [error]);

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
    if (viewState.get() !== 'Error') {
      getChunk(0, CHUNK_SIZE + 1)(res => {
        if (res.length) {
          setInitialData(res);
          viewState.set('Content');
        } else {
          viewState.set('Result');
        }
      });
    }
  }, [stateData.queryFilter, stateData.userFilter])

  const displayErrorState = () => (
    <div className="bi-c-h bi-align bi-center bi-grow">
      <div className="bi-empty-state bi-fade-in">
        <div className="bi-empty-state-icon bi-danger">
          <i className="bi-icon bi-danger">error_outline</i>
        </div>
        <div className="bi-empty-state-header" data-hook='history-error'>{stateData.errorMessage}</div>
      </div>
    </div>
  );

  const highlight = (title: string) => (haystack: string) => {
    const text = haystack.replace(/\s+/g,' ');
    
    if (title === 'query') {
      const currentFilter = stateData.queryFilter;
      const needlePresent = !!currentFilter;
      const wrapLinesCount = needlePresent ? 1 : 0;
      
      return <Highlighter
      searchWords={[currentFilter]}
      autoEscape={true}
      textToHighlight={extractTextAroundMatch(text, currentFilter || '', wrapLinesCount)}
      />
    }
    return text;
  }

  const displayLoadedState = () => (
    <div className='bi-section-content bi-c-h'>
      <div
        className='bi-panel bi-c-h bi-fade-in bi-theme--lighter'
        data-hook='history-content'
      >
        <div className='bi-panel-content bi-c-h'>
          <Table
            initialData={initialData}
            loadMore={getChunk}
            onRowClicked={onHistoryClicked}
            columns={historyTableFields.map(field => ({
              Header: field.title,
              accessor: field.name,
              Cell: table => field.filter(undefined, table.row.original, 0, highlight(field.name))
            }))}
            paginationSize={CHUNK_SIZE}
            tableSize={(size) => viewState.set(size > 0 ? 'Content' : 'Result', { size })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className='history-component bi-section bi-c-h bi-grow'>
      <div className='bi-section-header'>
        <div className='bi-align bi-s-h--x3'>
          <div className='bi-section-title'>
            History
            {stateData.size ? <span className='bi-fade-in'> ({stateData.size})</span> : ''}
          </div>
          <div className={`hc-filters bi-theme--lighter bi-align bi-space-h--x15`}>
            <Select
              defaultLabel={user}
              options={getUsers}
              title={'email'}
              unique={'email'}
              primaryLabel={'All users'}
              onOptionChange={(option) => {
                if (viewState.get() !== 'Error') {
                  viewState.set('Initial', { userFilter: option.id || '' });
                }
              }}
              inputDataHook='history-filter-user-select'
              liDataHook='history-filter-user-select-option'
            />
            <Input
              fullWidth={true}
              disableUnderline
              onChange={(e) => {
                if (viewState.get() !== 'Error') {
                  viewState.set('Initial', { queryFilter: e.target.value });
                }
              }}
              placeholder='Filter query'
              data-hook='history-filter-query-input'
            />
          </div>
        </div>
      </div>
        {
          {
            'Initial':
              <div className="bi-c-h bi-align bi-center bi-grow">
                <div className="bi-empty-state--loading bi-fade-in">
                  <div className="bi-empty-state-content" data-hook='history-initial'>Searching...</div>
                </div>
              </div>,
            'Content': displayLoadedState(),
            'Error': displayErrorState(),
            'Result': 
              <div className="bi-c-h bi-align bi-center bi-grow">
                <div className="bi-empty-state bi-fade-in">
                  <img className="bi-empty-state-image" src={noResultsImg}></img>
                  <div className="bi-empty-state-header" data-hook='history-result'>No results</div>
                </div>
              </div>,
          }[viewState.get()]
        }
    </div>
  );
}
