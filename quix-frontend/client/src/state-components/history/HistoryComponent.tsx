import React, { useState } from 'react';
import { IHistory } from '@wix/quix-shared';
import _ from 'lodash';
import { SortableTable } from '../../lib/ui/components/SortableTable';
import { historyTableFields } from './history-table-fields';
import {extractTextAroundMatch} from '../../services/search';
import Highlighter from 'react-highlight-words';
import makePagination from '../../lib/ui/components/hoc/makePagination';
import { User } from '../../lib/app/services/user';

export interface HistoryProps {
  history: IHistory[];
  error: { message: string };
  filter: {user: User, query: string};
  onHistoryClicked(history: IHistory): void;
  loadMore(offset: number, limit: number): void;
}

export const CHUNK_SIZE = 100;

const Table = makePagination(SortableTable);

export function History(props: HistoryProps) {
  const { history, error, onHistoryClicked, loadMore, filter } = props;

  const [tableSize, setTableSize] = useState(0);

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
          data={history}
          paginationSize={CHUNK_SIZE}
          tableSize={(size) => setTableSize(size)}
          filter={filter}
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
            {history && <span className='bi-fade-in'> ({tableSize})</span>}
          </div>
        </div>
      </div>
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
