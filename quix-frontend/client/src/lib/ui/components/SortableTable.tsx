import React from 'react';
import _ from 'lodash';
import { Row } from './Row';
import '../directives/search/search.scss';
import './SortableTable.scss';

export const SortableTable = ({
  columns,
  data,
  onRowClicked,
  getChunk,
  isChunking,
}) => {

  const scroll = (UIElement) => {
    const element = UIElement.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 1000) {
      getChunk();
    }
  }

  return (
    <>
      <div className="bi-table-container bi-table--nav bi-c-h bi-grow bi-table-sticky-header">
        <div onScroll={scroll} className="bi-fade-in">
          <table className="bi-table">
            <thead className="bi-tbl-header">
                  {columns.map((column, index) => (
                    <th className={column.className} key={index}>
                      <div className="bi-table-th-content bi-text--ui">
                        <span className="bi-align ng-scope">
                          <span className="bi-text--600 ng-binding">
                            {column.Header}
                          </span>
                        </span>
                      </div>
                    </th>
                  ))}
            </thead>

            <tbody>
              {
                data.map((fullRow, index) => {
                  return (
                    <Row
                      key={index}
                      onRowClicked={onRowClicked}
                      row={_.pick(fullRow, columns.map(column => column.accessor))}
                    />
                  )
                })
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
    </>
  );
};
