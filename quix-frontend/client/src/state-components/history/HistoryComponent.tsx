import * as React from "react";
import { IHistory } from "@wix/quix-shared";
import { SortableTable } from "../../lib/ui/components/SortableTable";
import { historyTableFields } from "./history-table-fields";
import Highlighter from "react-highlight-words"

export interface HistoryProps {
  history: IHistory[];
  error: { message: string };
  onHistoryClicked(history: IHistory): void;
  loadMore(): void;
}

export function History(props: HistoryProps) {
  const { history, error, onHistoryClicked } = props;

  const displayErrorState = () => (
    <div className="bi-empty-state--error" data-hook="history-error">
      <div className="bi-empty-state-header">error_outline</div>
      <div className="bi-empty-state-content">{error.message}</div>
    </div>
  );

  const highlight = (needle?: String) => (haystack: String) =>  <Highlighter
          searchWords={[needle]}
          autoEscape={true}
          textToHighlight={haystack}
        />

  let filter = "";
  const displayLoadedState = () => (
    <div className="bi-section-content bi-c-h">
      <div
        className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
        data-hook="history-content"
      >
        <div className="bi-panel-content bi-c-h">
          <SortableTable
            data={history}
            columns={historyTableFields.map(field => ({
              Header: field.title,
              accessor: field.name,
              Cell: table =>
                field.filter
                  ? field.filter(undefined, table.row.original, 0, highlight(filter))
                  : table.cell.value.toString()
            }))}
            onRowClicked={onHistoryClicked}
            getFilter={() => filter}
            setFilter={newFilter => {
              filter = newFilter;
            }}
          />
        </div>
      </div>
    </div>
  );
  return (
    <div className="bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div>
          <div className="bi-section-title">
            History
            {history && <span className="bi-fade-in"> ({history.length})</span>}
          </div>
        </div>
      </div>
      {!history ? (
        <div className="bi-section-content--center">
          {error ? (
            displayErrorState()
          ) : (
            <div className="bi-empty-state--loading bi-fade-in">
              <div className="bi-empty-state-content">Loading history...</div>
            </div>
          )}
        </div>
      ) : (
        displayLoadedState()
      )}
    </div>
  );
}
