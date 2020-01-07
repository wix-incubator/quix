import * as React from "react";
import { IHistory } from "@wix/quix-shared";
import { Table } from "../../lib/ui/components/Table";
import { historyTableFields } from "./history-table-fields";

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

  const displayLoadedState = () => (
    <div className="bi-section-content bi-c-h">
      <div
        className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
        data-hook="history-content"
      >
        <div className="bi-panel-content bi-c-h">
          <Table
            rows={history}
            rowsConfig={historyTableFields}
            onRowClicked={onHistoryClicked}
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
            {/* {history && <span className="bi-fade-in"> ({history.length})</span>} */}
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
