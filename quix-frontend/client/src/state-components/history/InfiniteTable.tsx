import * as React from 'react';
import toHumanCase from '../../lib/ui/filters/to-human-case';
import InfiniteScroll from 'react-infinite-scroller';
import * as _ from 'lodash'

interface TableProps<T> {
  rows: T[];
  rowsConfig: RowConfig<T>[];
  onRowClicked(T): any;
}

interface InfiniteTableProps<T> extends TableProps<T> {
    hasMore?: boolean,
    initialLoad?: boolean,
    isReverse?: boolean,
    loader?: React.ReactNode,
    loadMore?: Function,
    pageStart?: number,
    ref?: Function,
    getScrollParent?: Function,
    threshold?: number,
    useCapture?: boolean,
    useWindow?: boolean
}

export interface RowConfig<T> {
  name: keyof T;
  title?: string;
  filter?(value, item: T, index): React.ReactNode;
}

export const InfiniteTable = <T extends {}>(props: InfiniteTableProps<T>) => {
  return (
    <div
      className={
        'bi-table-container bi-table--nav bi-c-h bi-grow bi-table-sticky-header'
      }
    >
      <div className={'bi-fade-in'}>
        <table className={'bi-table'}>
          <thead className="bi-tbl-header">
            <tr>
              {props.rowsConfig.map((rowConfig, index) => (
                <th key={index}>
                  <div className="bi-table-th-content bi-text--ui">
                    <span className="bi-text--600">
                      {toHumanCase()(
                        rowConfig.title || (rowConfig.name as any)
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <InfiniteScroll {..._.pick(props, [
            "hasMore",
            "initialLoad",
            "loader",
            "loadMore",
            "pageStart"
            ])} hasMore={true} loadMore={(page) => console.log("aaaaa", page)} element={'tbody'}>
          {props.rows.map((rowElement, index) => (
            <tr
              key={index}
              onClick={() => props.onRowClicked(rowElement)}
              data-hook="table-row"
            >
              {props.rowsConfig.map((rowConfig, columnIndex) => (
                <td key={columnIndex}>
                  {rowConfig.filter
                    ? rowConfig.filter(
                        rowElement[rowConfig.name],
                        rowElement,
                        index
                      )
                    : rowElement[rowConfig.name]}
                </td>
              ))}
            </tr>
          ))}
          </InfiniteScroll>
        </table>
      </div>
    </div>
  );
};
