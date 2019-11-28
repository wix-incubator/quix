import * as React from 'react';
import toHumanCase from '../filters/to-human-case';

interface TableProps<T> {
  rows: T[];
  rowsConfig: RowConfig<T>[];
  onRowClicked(T): any;
}

export interface RowConfig<T> {
  name: keyof T;
  title?: string;
  filter?(value, item: T, index): React.ReactNode;
}

export const Table = <T extends {}>(props: TableProps<T>) => {
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
          <tbody>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};
