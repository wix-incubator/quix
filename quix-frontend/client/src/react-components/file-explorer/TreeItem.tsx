import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {TreeItemMenu} from './TreeItemMenu';
import {Highlighter} from '../../lib/ui/components/Highlighter';

export interface Node {
  id: string;
  name: string;
  type: string;
  transformed: boolean;
  lazy?: boolean;
  icon?: string;
  textIcon?: string;
  children?: Node[];
  more?: boolean;
}

interface TreeItemProps {
  node: Node;
  menuOptions: {
    [key:string]: {
      title: string;
    }[];
  };
  path: string[];
  highlight: string;
  expandAllNodes: boolean;
  onMenuClick(node: Node, option: { title: string }, path: string[]): void;
  onTransformChildNodes(node: Node, path: string[]): Node;
  onTransformChildNodesLazy(node: Node, path: string[]): Promise<Node>;
}


const InnerTreeItem = ({
    node: initialNode,
    menuOptions,
    path,
    highlight,
    expandAllNodes,
    onMenuClick,
    onTransformChildNodes,
    onTransformChildNodesLazy,
  }: TreeItemProps) => {
  const [node] = useState<Node>(initialNode);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [clickedFirstTime, setClickedFirstTime] = useState(false);

  useEffect(() => {
    if (!node.lazy && expandAllNodes) {
      toggleNode();
    }
  }, []);

  const onClick = async () => {
    if (!expanded) {
      toggleNode();
    } else {
      setExpanded(false);
    }
    if (!clickedFirstTime) {
      setClickedFirstTime(true);
    }
  }

  const toggleNode = async () => {
    setExpanded(true);
    if (!node.children || !node.children.find(child => !child.transformed)) {
      return;
    }

    if (node.lazy) {
      setIsLoading(true);
      const transformedNode = await onTransformChildNodesLazy(node, path);
      node.children = transformedNode.children;
      setIsLoading(false);
    } else {
      const transformedNode = onTransformChildNodes(node, path);
      node.children = transformedNode.children;
    }
  }

  const preIcon = (_onClick: () => void) => (
    isLoading ? 
      <span className="bi-align">
        <span data-hook="tree-item-loading-icon" className="bi-align bi-spinner--xs">
        </span>
      </span>
    : Array.isArray(node.children) ?
        expanded ?
        <i onClick={_onClick} className="bi-action bi-icon--sm" data-hook="tree-item-opened-icon">arrow_right</i>
        : <i onClick={_onClick} className="bi-action bi-icon--sm" data-hook="tree-item-closed-icon">arrow_drop_down</i>
      : null
  )

  const describeIcon = (
    node.textIcon ?
    <div className="bi-text--sm">{node.textIcon}</div>
    : <i className="bi-icon--xs">{node.icon || 'hourglass_empty'}</i>
  )

  const menu = (
    menuOptions[node.type] ?
      <TreeItemMenu
        menuOptions={menuOptions[node.type]}
        onMenuClick={(option) => onMenuClick(node, option, path)}
      />
      : null
  )

  const getText = () => {
    if (highlight && node.children) {
        return (
        <Highlighter
          term={node.name}
          filter={highlight}
        />
      );
    }
    return node.name;
  }

  return (
    <li>
      <div className={`fe-item bi-spread bi-fade-in bi-hover bi-muted fe-item-depth-${path.length} ui-droppable-disabled`}>
        <div
        className="bi-align bi-grow">
          {preIcon(onClick)}
          <span className="bi-r-h bi-spread bi-pointer">
            <span
              onClick={onClick}
              className="fe-item-name bi-s-h--x05 bi-align bi-grow bi-text--ellipsis"
            >
              <span className="fe-icon-container">
                {describeIcon}
              </span>
              <span data-hook="tree-item-content" className="bi-text--ellipsis">
              {getText()}
              </span>
            </span>

            {menu}

          </span>
        </div>
      </div>
      <ul>
        {
          expanded && !isLoading ? 
            node.children?.map(childNode =>
              childNode.id &&
              <InnerTreeItem
                key={childNode.id}
                menuOptions={menuOptions}
                node={childNode}
                onTransformChildNodes={onTransformChildNodes}
                onTransformChildNodesLazy={onTransformChildNodesLazy}
                onMenuClick={onMenuClick}
                path={[...path, node.id]}
                expandAllNodes={!clickedFirstTime ? expandAllNodes : false}
                highlight={highlight}
              />
            )
          : null
        }
      </ul>
    </li>
  )
}

function TreeItemPropsAreEqual(prevProps, nextProps) {
  const prevNode: Node = prevProps.node;
  const nextNode: Node = nextProps.node;
  
  return prevNode.id === nextNode.id;
}

export const TreeItem = React.memo(InnerTreeItem, TreeItemPropsAreEqual);