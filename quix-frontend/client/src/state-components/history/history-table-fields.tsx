import { IHistory } from "@wix/quix-shared";
import biRelativeDate from "../../lib/ui/filters/relative-date";
import * as React from "react";
import { RowConfig } from "../../lib/ui/components/Table";

export const historyTableFields: RowConfig<IHistory>[] = [
  {
    name: "name",
    title: "history",
    filter(_, history: IHistory, index) {
      return (
        <div className="bi-align bi-s-h">
          <img className="quix-history-avatar" src={history.avatar} />
          <span>{history.name}</span>
        </div>
      );
    }
  },
  {
    name: "email"
  },
  {
    name: "dateCreated",
    title: "Join Date",
    filter(_, history: IHistory, index) {
      return (
        <span className="bi-text--sm bi-muted">
          {biRelativeDate()(history.dateCreated as any)}
        </span>
      );
    }
  },
  {
    name: "dateUpdated",
    title: "Last Login",
    filter(_, history: IHistory, index) {
      return (
        <span className="bi-text--sm bi-muted">
          {biRelativeDate()(history.dateUpdated as any)}
        </span>
      );
    }
  }
];
