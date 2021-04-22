import React from 'react';

export interface RowProps {
  columns: {
    header: string;
    renderRow(cell: any): React.ReactNode;
    accessor: string;
    className: string;
  }[];
  onRowClicked(row: any): void;
  row: {};
}

export const Row = ({
  row,
  onRowClicked,
  columns,
}: RowProps) => {
  return (
    <tr
      onClick={() => onRowClicked(row)}
      data-hook="table-row"
    >
      {columns.map((column, index) => {
        return (
          <td
            key={index}
            className={'bi-table-cells bi-table-cell-' + column.accessor}
          >
            {column.renderRow(row)}
          </td>
        );
      })}
    </tr>
  );
};
