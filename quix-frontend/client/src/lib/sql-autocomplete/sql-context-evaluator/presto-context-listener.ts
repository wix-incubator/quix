import prestoLanguage from '../../language-parsers/presto-grammar';
import { ContextType } from './types';

export class PrestoContextListener extends prestoLanguage.SqlBaseListener
  .SqlBaseListener {
  private _identifier: string;
  private _nodeFound: any;
  private _contextType: ContextType;
  private _insidePrestoWithFlag: boolean;
  private readonly _withNodes: any[] = [];

  set identifier(value: string) {
    this._identifier = value;
  }

  get withNodes() {
    return this._withNodes;
  }

  get nodeFound() {
    return this._nodeFound;
  }

  get contextType() {
    return (this._nodeFound && this._contextType) ?? ContextType.Undefined;
  }

  get querySpecificationNode() {
    let currentNode = this._nodeFound;
    let querySpecificationNode: any;

    while (currentNode && !querySpecificationNode) {
      switch (currentNode.constructor.name) {
        case 'QuerySpecificationContext':
          querySpecificationNode = currentNode;
          break;
        case 'QueryNoWithContext':
          querySpecificationNode = currentNode
            .queryTerm()
            .queryPrimary()
            .querySpecification();
          break;
        default:
      }
      currentNode = currentNode.parentCtx;
    }

    return querySpecificationNode;
  }

  enterUnquotedIdentifier(ctx: any) {
    if (ctx.getText() === this._identifier) {
      this._nodeFound = ctx;

      if (this._insidePrestoWithFlag) {
        this._withNodes.pop();
      }
    }
  }

  enterColumnReference(ctx: any) {
    if (!this._nodeFound) {
      this._contextType = ContextType.Column;
    }
  }

  enterSelectSingle(ctx: any) {
    if (!this._nodeFound) {
      this._contextType = ContextType.Column;
    }
  }

  enterJoinCriteria(ctx: any) {
    if (!this._nodeFound) {
      this._contextType = ContextType.Column;
    }
  }

  enterTableName(ctx: any) {
    if (!this._nodeFound) {
      this._contextType = ContextType.Table;
    }
  }

  enterPresto_with(ctx: any) {
    this._insidePrestoWithFlag = true;
  }

  exitPresto_with(ctx: any) {
    this._insidePrestoWithFlag = false;
  }

  enterNamedQuery(ctx: any) {
    if (this._insidePrestoWithFlag) {
      this._withNodes.push(ctx);
    }
  }
}
