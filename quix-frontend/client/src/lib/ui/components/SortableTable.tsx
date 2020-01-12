import * as React from 'react';
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination
} from 'react-table';
import ReactPaginate from 'react-paginate';
import '../directives/search/search.scss';

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
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    pageCount,
    gotoPage
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 20
      }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

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

        <div style={{ float: "right" }} className={"bi-button-group"}>
          <ReactPaginate
            pageCount={pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            previousLabel={<i className="bi-icon--sm">keyboard_arrow_left</i>}
            nextLabel={<i className="bi-icon--sm">keyboard_arrow_right</i>}
            containerClassName={"bi-button-group"}
            breakLinkClassName={"bi-button"}
            nextLinkClassName={"bi-button"}
            previousLinkClassName={"bi-button"}
            activeLinkClassName={"bi-button--primary"}
            pageLinkClassName={"bi-button"}
            onPageChange={pageData => {
              gotoPage(pageData.selected);
            }}
          />
        </div>
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
