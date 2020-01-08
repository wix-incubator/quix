import * as React from "react";
import { useTable, useSortBy, useGlobalFilter, usePagination} from "react-table";
import "../directives/search/search.scss";

function GlobalFilter({ preGlobalFilteredRows, getFilter, setGlobalFilter }) {
  return (
    <span className="bi-search--rnd ng-pristine ng-untouched ng-valid ng-isolate-scope ng-not-empty">
      <input
        className="bi-input bi-grow ng-pristine ng-untouched ng-valid ng-empty ng-valid-minlength"
        ng-class="{
          'bs-has-context-icon': !!options.contextIcon,
          'bs-has-text': !!model.text
        }"
        ng-model="model.text"
        ng-keypress="events.onKeypress($event)"
        placeholder="Filter results..."
        value={getFilter() || ""}
        onChange={e => {
          setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
      ></input>

      <span className="bs-close"></span>
    </span>
  );
}

export const SortableTable = ({
  columns,
  data,
  onRowClicked,
  setFilter,
  getFilter
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // We don't want to render all 2000 rows for this example, so cap
  // it at 20 for this use case
  // const firstPageRows = rows.slice(0, 20);

  return (
    <>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        getFilter={getFilter}
        setGlobalFilter={gf => {
          setFilter(gf);
          setGlobalFilter(gf);
        }}
      />
      <div
        className={
          "bi-table-container bi-table--nav bi-c-h bi-grow bi-table-sticky-header"
        }
      >
        <div className={"bi-fade-in"}>
          <table {...getTableProps()} className={"bi-table"}>
            <thead className="bi-tbl-header">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      <div className="bi-table-th-content bi-text--ui bi-text--600">
                        <span className="bi-tbl-sort-icon bi-icon--sm ng-binding bi-primary">
                          {column.isSorted
                            ? column.isSortedDesc
                              ? "arrow_drop_down"
                              : "arrow_drop_up"
                            : "unfold_more"}
                        </span>
                        <span className="bi-text--600">
                          {column.render("Header")}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row, index) => {
                prepareRow(row);
                return (
                  <tr
                    key={index}
                    {...row.getRowProps()}
                    onClick={() => onRowClicked(row.original)}
                    data-hook="table-row"
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
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const pageIdx = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(pageIdx)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSizeOption => (
            <option key={pageSizeOption} value={pageSizeOption}>
              Show {pageSizeOption}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
