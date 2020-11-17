import React, { useEffect, useState } from 'react';
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination
} from 'react-table';
import '../directives/search/search.scss';

export const SortableTable = ({
  columns,
  data,
  onRowClicked,
  getChunk,
  isChunking,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 10000
      }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const currentRows = page.length < rows.length ? [] : rows;
    setRows([...currentRows, ...page.slice(rows.length).map((row, index) => {
      prepareRow(row);
      return (
        <tr
          key={index}
          {...row.getRowProps()}
          onClick={() => onRowClicked(row.original)}
          data-hook="history-table-row"
        >
          {row.cells.map(cell => {
            return (
              <td
                {...cell.getCellProps()}
                className={"bi-table-cell-" + cell.column.id}
              >
                {cell.render("Cell")}
              </td>
            );
          })}
        </tr>
      );
    })]);
  }, [page.length]);

  const scroll = (UIElement) => {
    const element = UIElement.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 1000) {
      getChunk();
    }
  }


  return (
    <>
      <div
        className={
          "bi-table-container bi-table--nav bi-c-h bi-grow bi-table-sticky-header"
        }
      >
        <div onScroll={scroll} className={"bi-fade-in"}>
          <table {...getTableProps()} className={"bi-table"}>
            <thead className="bi-tbl-header">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      <div className="bi-table-th-content bi-text--ui">
                        <span className="bi-align bi-pointer ng-scope">
                          <span
                            className={
                              "bi-tbl-sort-icon bi-icon--sm ng-binding " +
                              (column.id === "email" ? "bi-primary" : "")
                            }
                            style={{
                              margin: "0 0 0 -8px"
                            }}
                          >
                            {column.isSorted
                              ? column.isSortedDesc
                                ? "arrow_drop_down"
                                : "arrow_drop_up"
                              : "unfold_more"}
                          </span>
                          <span className="bi-text--600 ng-binding">
                            {column.render("Header")}
                          </span>
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows}
            </tbody>
          </table>
          {isChunking ? <div className='bi-empty-state'>
            <div className='bi-empty-state-content'>Loading...</div>
          </div>: null}
        </div>
      </div>
    </>
  );
};
