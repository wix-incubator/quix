import { IHistory } from "@wix/quix-shared";
import biRelativeDate from "../../lib/ui/filters/relative-date";
import * as React from "react";
import { RowConfig } from "../../lib/ui/components/Table";

export const historyTableFields: RowConfig<IHistory>[] = [
  {
    name: "id",
    title: "ID",
    filter(_, history: IHistory, index) {
      return (
        <div className="bi-align bi-s-h" title={history.id}>
          <span>{history.id.substring(0, 8)}</span>
        </div>
      );
    }
  },
  {
    name: "email"
  },
  {
    name: "query",
    title: "Query",
    filter(_, history: IHistory, index) {
      const hasQuery = history.query.length > 0;
      const fullQuery = hasQuery ? history.query.join(";\n") + ";" : "";
      const firstLine = hasQuery ? history.query[0] : "";
      return <pre title={fullQuery}>{firstLine + "..."}</pre>;
    }
  },
  {
    name: "moduleType",
    title: "Note Type",
    filter(_, history: IHistory, index) {
      return (
        <span className="bi-text--md bi-muted">
          {history.moduleType as any}
        </span>
      );
    }
  },
  {
    name: "startedAt",
    title: "Started At",
    filter(_, history: IHistory, index) {
      return (
        <span className="bi-text--md bi-muted">
          {biRelativeDate()(history.startedAt as any)}
        </span>
      );
    }
  }
];
