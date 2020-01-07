import * as React from "react";
// import toHumanCase from "../filters/to-human-case";
import { useTable, useSortBy } from "react-table";

export const SortableTable = ({ columns, data, onRowClicked }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  // We don't want to render all 2000 rows for this example, so cap
  // it at 20 for this use case
  const firstPageRows = rows.slice(0, 20);

  return (
    <div className={"bi-fade-in"}>
      <table {...getTableProps()} className={"bi-table"}>
        <thead className="bi-tbl-header">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
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
          {firstPageRows.map((row, index) => {
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
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
