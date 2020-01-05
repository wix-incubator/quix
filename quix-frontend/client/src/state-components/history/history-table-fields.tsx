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
        <div className="bi-align bi-s-h">
          <span>{history.id}</span>
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
      return <pre>{history.query.join(";\n") as any}</pre>;
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
