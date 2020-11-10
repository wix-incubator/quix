import React, { useState } from 'react';
import { IHistory } from '@wix/quix-shared';
import _ from 'lodash';
import { SortableTable } from '../../lib/ui/components/SortableTable';
import { historyTableFields } from './history-table-fields';
import {extractTextAroundMatch} from '../../services/search';
import Highlighter from 'react-highlight-words';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import Select from '../../lib/ui/components/Select';
import { User } from '../../lib/app/services/user';

export interface HistoryProps {
  error: { message: string };
  user: User;
  onHistoryClicked(history: IHistory): void;
  loadMore({offset, limit, rest}: {offset: number; limit: number; rest: object}): Promise<IHistory[]>;
  getUsers(): User[];
}

export const CHUNK_SIZE = 100;

const Table = makePagination(SortableTable);

export function History(props: HistoryProps) {
  const { error, onHistoryClicked, loadMore, user, getUsers } = props;

  const [tableSize, setTableSize] = useState<number>(0);

  const [userUniqueFilter, setUserUniqueFilter] = useState<string>(user.getId());
  const [queryFilter/*, setQueryFilter*/] = useState<string>('');

  const displayErrorState = () => (
    <div className='bi-empty-state--error' data-hook='history-error'>
      <div className='bi-empty-state-header'>error_outline</div>
      <div className='bi-empty-state-content'>{error.message}</div>
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
          loadMore={loadMore}
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
          tableSize={(size) => setTableSize(size)}
          filter={{user: userUniqueFilter, query: queryFilter}}
          />
        </div>
      </div>
    </div>
  );

  //add filter by query on history-component
  return (
    <div className='bi-section bi-c-h bi-grow'>
      <div className='bi-section-header'>
        <div>
          <div className='bi-section-title'>
            History
            {tableSize ? <span className='bi-fade-in'> ({tableSize})</span> : ''}
          </div>
        </div>
      </div>
      <div className='bi-theme--lighter' style={{paddingLeft: '15px'}}>
        <Select
          defaultValue={user}
          options={getUsers}
          title={'email'}
          unique={'id'}
          primaryValue={'All users'}
          onOptionChange={(option) => setUserUniqueFilter(option.id)}
          />
        </div>
        {/* <Input
          defaultValue={user}
          options={getUsers}
          title={'email'}
          unique={'id'}
          primaryValue={'All users'}
          onOptionChange={(option) => setUserUniqueFilter(option.id)}
        /> */}
      {!history ? (
        <div className='bi-section-content--center'>
          {error ? (
            displayErrorState()
          ) : (
            <div className='bi-empty-state--loading bi-fade-in'>
              <div className='bi-empty-state-content'>Loading history...</div>
            </div>
          )}
        </div>
      ) : (
        displayLoadedState()
      )}
    </div>
  );
}
