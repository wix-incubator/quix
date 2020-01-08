import * as React from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination
} from "react-table";
import ReactPaginate from "react-paginate";
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
      <div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          getFilter={getFilter}
          setGlobalFilter={gf => {
            setFilter(gf);
            setGlobalFilter(gf);
          }}
        />

        <div
          className="pagination quix-search-pagination bi-button-group bi-fade-in ng-scope"
          style={{ float: "right" }}
        >
          <ReactPaginate
            containerClassName="quix-search-pagination bi-button-group bi-fade-in ng-scope"
            className="quix-search-pagination bi-button-group bi-fade-in ng-scope"
            pageCount={pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            previousLabel={<i className="bi-icon--sm">keyboard_arrow_left</i>}
            nextLabel={<i className="bi-icon--sm">keyboard_arrow_right</i>}
            // breakClassName={"bi-button"}
            breakLinkClassName={"bi-button"}
            nextLinkClassName={"bi-button"}
            previousLinkClassName={"bi-button"}
            // pageClassName={"bi-button"}
            pageLinkClassName={"bi-button"}
            // activeClassName={"bi-button--primary"}
            activeLinkClassName={"bi-button--primary"}
            onPageChange={pageData => {
              setPageSize(1);
              gotoPage(pageData.selected);
            }}
          ></ReactPaginate>
        </div>

        {/* <div
          className="pagination quix-search-pagination bi-button-group bi-fade-in ng-scope"
          style={{ float: "right" }}
        >
          <button
            className={"bi-button"}
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <i className="bi-icon--sm">keyboard_arrow_left</i>
          </button>
          <button
            className={"bi-button" + (pageIndex === 0 ? "--primary" : "")}
            onClick={() => gotoPage(0)}
          >
            {"1"}
          </button>
          <button
            className={"bi-button" + (pageIndex === 1 ? "--primary" : "")}
            onClick={() => gotoPage(1)}
          >
            {"2"}
          </button>
          <button
            className={"bi-button"}
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <i className="bi-icon--sm">keyboard_arrow_right</i>
          </button> */}
        {/* <span className="ng-binding">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const pageIdx = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(pageIdx);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSizeOption => (
            <option key={pageSizeOption} value={pageSizeOption}>
              Show {pageSizeOption}
            </option>
          ))}
        </select> */}
        {/* </div> */}
      </div>
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
    </>
  );
};
