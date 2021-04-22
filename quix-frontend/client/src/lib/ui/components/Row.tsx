import React from 'react';

export const Row = ({
  row,
  onRowClicked,
}) => {
  return (
    <tr
      onClick={() => onRowClicked(row)}
      data-hook="table-row"
    >
      {Object.keys(row).map((cell, index) => {
        return (
          <td
            key={index}
            className={'bi-table-cells bi-table-cell-' + cell}
          >
            {row[cell]}
          </td>
        );
      })}
    </tr>
  );
};
