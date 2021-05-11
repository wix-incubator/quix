import React from 'react';
import { TableRow } from './TableRow';
import '../../directives/search/search.scss';
import './Table.scss';

export interface TableProps {
  hookName?: string;
  columns: {
    header: string;
    render(cell: any): React.ReactNode;
    accessor: string;
    className: string;
  }[];
  data: any[];
  onRowClicked(row: any): void;
  getChunk?(): void;
  isChunking?: boolean;
}

export const Table = ({
  hookName,
  columns,
  data,
  onRowClicked,
  getChunk,
  isChunking = false,
}: TableProps) => {

  const scroll = (UIElement) => {
    const element = UIElement.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 1000) {
      getChunk && getChunk();
    }
  }

  return (
    <div
      className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
      data-hook={hookName ? hookName + '-table' : 'table'}
    >
      <div className="bi-panel-content bi-c-h">
        <div className="bi-table-container bi-table--nav bi-c-h bi-grow bi-table-sticky-header">
          <div onScroll={scroll} className="bi-fade-in">
            <table className="bi-table">
              <thead className="bi-tbl-header">
                <tr>
                    {columns.map((column, index) => (
                      <th className={column.className} key={index}>
                        <div className="bi-table-th-content bi-text--ui">
                          <span className="bi-align ng-scope">
                            <span className="bi-text--600 ng-binding">
                              {column.header}
                            </span>
                          </span>
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {
                  data.map((fullRow, index) => (
                      <TableRow
                        key={index}
                        onRowClicked={onRowClicked}
                        row={fullRow}
                        columns={columns}
                      />
                    )
                  )
                }
              </tbody>
            </table>

            {isChunking ?
              <div className='bi-empty-state'>
                <div className='bi-empty-state-content'>Loading...</div>
              </div>
              : null
            }
          </div>
        </div>
      </div>
    </div>
  );
};
