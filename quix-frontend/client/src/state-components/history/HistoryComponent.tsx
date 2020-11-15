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
import noResultsImg from '../../../src/assets/no_data.svg';
import { debounceAsync } from '../../utils';
import Input from '@material-ui/core/Input';

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
    userFilter: user.getId(),
    queryFilter: '',
    error: '',
  });

  useEffect(() => {
    if (error) {
      viewState.set('Error', { error: error.message });
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
    getChunk(0, CHUNK_SIZE + 1)(res => {
      setInitialData(res);
      viewState.set('Content');
    });
  }, [stateData.queryFilter, stateData.userFilter])

  const displayErrorState = () => (
    <div className='bi-empty-state--error' data-hook='history-error'>
      <div className='bi-empty-state-header'>error_outline</div>
      <div className='bi-empty-state-content'>{stateData.error}</div>
    </div>
  );

  const getAndTrimFirstLine = (text: string = '', maxLength: number = 20): string => {
    const lines = text.split('\n');
    const firstLine = lines[0];
    const needsElipsis = lines.length > 1 || firstLine.length > maxLength;

    return firstLine.substring(0, maxLength) + (needsElipsis ? '...' : '');
  }

  const highlight = (needle?: string) => (haystack: string) => { 
    const needlePresent = !!needle;
    const wrapLinesCount = needlePresent ? 1 : 0;
    const text = needlePresent ? haystack : getAndTrimFirstLine(haystack, 30);

    return <Highlighter
      searchWords={[needle]}
      autoEscape={true}
      textToHighlight={extractTextAroundMatch(text, needle || '', wrapLinesCount)}
  />
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
              Cell: table =>
                field.filter
                  ? field.filter(undefined, table.row.original, 0, highlight(''))
                  : table.cell.value.toString()
            }))}
            paginationSize={CHUNK_SIZE}
            tableSize={(size) => viewState.set(size > 0 ? 'Content' : 'Result', { size })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className='bi-section bi-c-h bi-grow'>
      <div className='bi-section-header'>
        <div>
          <div className='bi-section-title'>
            History
            {stateData.size ? <span className='bi-fade-in'> ({stateData.size})</span> : ''}
          </div>
        </div>
      </div>
      <div className='bi-theme--lighter bi-align bi-space-h--x15' style={{paddingLeft: '15px'}}>
        <Select
          defaultValue={user}
          options={getUsers}
          title={'email'}
          unique={'id'}
          primaryValue={'All users'}
          onOptionChange={(option) => viewState.set('Initial', { userFilter: option.id || '' })}
          placeHolder='Filter user'
          inputDataHook='history-filter-user-select'
          ulDataHook='history-filter-user-select-options'
        />
        <Input
          disableUnderline
          className={'bi-input'}
          onChange={(e) => viewState.set('Initial', { queryFilter: e.target.value })}
          placeholder='Filter query'
          data-hook='history-filter-query-input'
        />
      </div>
        {
          {
            'Initial':
              <div className="bi-c-h bi-align bi-center bi-grow">
                <div className="bi-empty-state--loading bi-fade-in">
                  <div className="bi-empty-state-content">Searching...</div>
                </div>
              </div>,
            'Content': displayLoadedState(),
            'Error': displayErrorState(),
            'Result': 
              <div className="bi-c-h bi-align bi-center bi-grow">
                <div className="bi-empty-state bi-fade-in">
                  <img className="bi-empty-state-image" src={noResultsImg}></img>
                  <div className="bi-empty-state-header">No results</div>
                </div>
              </div>,
          }[viewState.get()]
        }
    </div>
  );
}
