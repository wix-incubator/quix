import prestoLanguage from '../../presto-grammar';
import {ContextNode, Terminal} from './types';

export class PrestoListener extends prestoLanguage.SqlBaseListener.SqlBaseListener {
  private readonly strings: Set<string> = new Set();
  private readonly tables: Set<string> = new Set();
  private readonly columns: Set<string> = new Set();
  private readonly subQueries: Set<string> = new Set();
  private readonly tableAlias: Set<string> = new Set();

  private allowColumnReference = true;

  parseResults() {
    const strings = [...this.strings];
    const columns = [...this.columns];
    const subQueries = [...this.subQueries];
    for (const sq of subQueries) {
      this.tables.delete(sq);
    }
    const tables = [...this.tables];
    const tableAlias = [...this.tableAlias];

    return {strings, tables, columns, subQueries, tableAlias};
  }

  enterStringLiteral(ctx: ContextNode & {children: [Terminal]}) {
    this.strings.add(ctx.children[0].symbol.text);
  }

  enterTableName(ctx: ContextNode) {
    this.tables.add((ctx as any).qualifiedName().getText());
  }

  enterColumnReference(ctx: ContextNode) {
    if (this.allowColumnReference) {
      this.columns.add(ctx.start.text);
    }
  }

  enterDereference(ctx: ContextNode) {
    this.columns.add((ctx as any).getText());
    this.allowColumnReference = false;
  }

  exitDereference(ctx: ContextNode) {
    this.allowColumnReference = true;
  }

  enterNamedQuery(ctx: ContextNode) {
    this.subQueries.add((ctx as any).identifier().getText());
  }

  enterAliasedRelation(ctx: any) {
    if (ctx.alias) {
      this.tableAlias.add(ctx.alias.getText());
    }
  }
  enterSelectSingle(ctx: any) {
    const identifier = ctx.identifier();
    if (identifier) {
      this.columns.add(identifier.getText());
    }
  }

  enterTypeConstructor(ctx: any) {
    this.strings.add(ctx.STRING().getText());
  }

}
