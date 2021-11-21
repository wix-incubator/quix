import {
  SqlBaseListener,
  SqlBaseParser,
} from '../../language-parsers/presto-grammar';
import { ContextType } from './types';

/**
 * A listener to parse an Antlr4 syntax tree for presto grammar.
 * To use the listener first set an identifier and than use the DEFAULT.walk method in Antlr4.
 * The listener collects data that defines the query context based on the identifier location in the tree.
 *  
 * @extends {SqlBaseListener} Auto-generated listener by Antlr4 for presto grammar
 */
export class PrestoContextListener extends SqlBaseListener {
  private identifier: string;
  private nodeFound: any;
  private contextType: ContextType;
  private insidePrestoWithFlag: boolean;
  private missingJoin: boolean = false;
  private missingBy: boolean = false;
  private readonly withNodes: any[] = [];

  setIdentifier(value: string) {
    this.identifier = value;
  }

  /**
   * @returns {any[]} an array of NamedQueryNode (which defines WITH table) that collected 
   * during the 'walk' over the Antlr4 tree.
   */
  getWithNodes(): any[] {
    return this.withNodes;
  }

  /**
   * @returns {any} the tree node that matches the identifier during the 'walk' over the Antlr4 tree.
   */
  getNodeFound(): any {
    return this.nodeFound;
  }

  /**
   * The context type is evaluated based on the node found during the 'walk' over the Antlr4 tree.
   *
   * @returns {ContextType} context type
   */
  getContextType(): ContextType {
    return (this.nodeFound && this.contextType) ?? ContextType.Undefined;
  }

  /**
   * Using the node found (which indicates the position to evaluate the context) finds
   * the next querySpecificationNode up the tree.
   *
   * @returns {any} querySpecificationNode
   */
  getQuerySpecificationNode(): any {
    let currentNode = this.nodeFound;
    let querySpecificationNode: any;

    while (currentNode && !querySpecificationNode) {
      switch (currentNode.ruleIndex) {
        case SqlBaseParser.RULE_querySpecification:
          querySpecificationNode = currentNode;
          break;
        case SqlBaseParser.RULE_queryNoWith:
          querySpecificationNode = currentNode
            .queryTerm()
            .queryPrimary()
            .querySpecification();
          break;
        default:
          currentNode = currentNode.parentCtx;
      }
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

  enterColumnReference(_ctx: any) {
    if (!this.nodeFound && !this.missingBy) {
      this.contextType = ContextType.Column;
    }
  }

  exitColumnReference(_ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Undefined;
    }

    this.missingBy = false;
  }

  enterSelectSingle(_ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Column;
    }
  }

  exitSelectSingle(_ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Undefined;
    }
  }

  enterJoinCriteria(_ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Column;
    }
  }

  exitJoinCriteria(_ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Undefined;
    }
  }

  enterJoinType(ctx: any) {
    if (!this.nodeFound) {
      this.missingJoin = this.missingChildrenExists(
        ctx.parentCtx,
        SqlBaseParser.JOIN
      );
    }
  }

  enterGroupBy(ctx: any) {
    if (!this.nodeFound) {
      this.missingBy = this.missingChildrenExists(
        ctx.parentCtx,
        SqlBaseParser.BY
      );
    }
  }

  enterSortItem(ctx: any) {
    if (!this.nodeFound) {
      this.missingBy = this.missingChildrenExists(
        ctx.parentCtx,
        SqlBaseParser.BY
      );
    }
  }

  enterTableName(_ctx: any) {
    if (!this.nodeFound && !this.missingJoin) {
      this.contextType = ContextType.Table;
    }
  }

  exitTableName(_ctx: any) {
    if (!this.nodeFound) {
      this.contextType = ContextType.Undefined;
    }

    this.missingJoin = false;
  }

  enterPresto_with(_ctx: any) {
    this.insidePrestoWithFlag = true;
  }

  exitPresto_with(_ctx: any) {
    this.insidePrestoWithFlag = false;
  }

  enterNamedQuery(ctx: any) {
    if (this.insidePrestoWithFlag) {
      this.withNodes.push(ctx);
    }
  }

  missingChildrenExists(ctx: any, symbolType: any) {
    return (
      ctx.children.find(
        (child: any) =>
          child
            .getText()
            .toLowerCase()
            .indexOf('missing') !== -1 && child.symbol.type === symbolType
      ) !== undefined
    );
  }
}
