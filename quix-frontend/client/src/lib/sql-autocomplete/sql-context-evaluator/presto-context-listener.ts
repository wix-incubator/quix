import { SqlBaseListener } from '../../language-parsers/presto-grammar';
import { ContextType } from './types';

export class PrestoContextListener extends SqlBaseListener {
  private identifier: string;
  private nodeFound: any;
  private contextType: ContextType;
  private insidePrestoWithFlag: boolean;
  private readonly withNodes: any[] = [];

  setIdentifier(value: string) {
    this.identifier = value;
  }

  getWithNodes() {
    return this.withNodes;
  }

  getNodeFound() {
    return this.nodeFound;
  }

  getContextType() {
    return (this.nodeFound && this.contextType) ?? ContextType.Undefined;
  }

  getQuerySpecificationNode() {
    let currentNode = this.nodeFound;
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
    if (ctx.getText() === this.identifier) {
      this.nodeFound = ctx;

      if (this.insidePrestoWithFlag) {
        this.withNodes.pop();
      }
    }
  }

  enterColumnReference(ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Column;
    }
  }

  enterSelectSingle(ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Column;
    }
  }

  enterJoinCriteria(ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Column;
    }
  }

  enterTableName(ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Table;
    }
  }

  enterPresto_with(ctx: any) {
    this.insidePrestoWithFlag = true;
  }

  exitPresto_with(ctx: any) {
    this.insidePrestoWithFlag = false;
  }

  enterNamedQuery(ctx: any) {
    if (this.insidePrestoWithFlag) {
      this.withNodes.push(ctx);
    }
  }
}
