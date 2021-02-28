import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {TreeView} from '@material-ui/lab';
import { v4 as uuid } from 'uuid';
import {TreeItem, Node} from './TreeItem';


export interface FileExplorerProps {
  tree: Tree[] | Tree;
  onTransformNode(node: Tree, path: string[]): Tree;
  onFetchChildren?(node: Tree, path: string[]): Promise<Tree[]>;
  menuOptions: {
    [key:string]: {
      title: string;
      action(sub: Tree, path: string[]): void;
    }[];
  };
  expandedNodes: boolean;
}

export interface Tree {
  id: string;
  name: string;
  type: string;
  transformed: boolean;
  lazy?: boolean;
  icon?: string;
  textIcon?: string;
  children?: Tree[];
}

const getAllNodeSubIds = (node: Tree, subIds: string[] = [], withLazy: boolean = true) => {
  if (!node.children) {
    return subIds;
  }

  node.children.map(child => {
    if (child.id && (withLazy || !child.lazy)) {
      subIds.push(child.id);
    }

    getAllNodeSubIds(child, subIds, withLazy);
  });

  return subIds;
}


export const FileExplorer = (props: FileExplorerProps) => {

  const [innerTree, setInnerTree] = useState<Tree[]>([]);
  const [expanded] = useState([]);

  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    const transformedNode = transformChildNodes(
      {
        children: Array.isArray(props.tree) ? props.tree : [props.tree]
      } as Node,
      [],
    );
    setInnerTree(transformedNode.children);
  }, [props.tree]);

  const handleToggleNode = (node: Node) => {
    if (!expanded.includes(node.id)) {
      expanded.push(node.id);
    } else {
      const subIds = getAllNodeSubIds(node, [node.id]);
      const deleteArray = subIds.map(subId => expanded.indexOf(subId));
      deleteArray.forEach(deleteIndex => deleteIndex !== -1 && expanded.splice(deleteIndex, 1));
    }
    forceUpdate();
  }
  
  const updateNode = (subNode: Node, transformedNode: Node, iteratorNode: Tree, path: string[]) => {
    const fullPath = [...path, transformedNode.id || subNode.id];
  
    for (let i = 1; i < fullPath.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === fullPath[i]);
    }

    iteratorNode.children = transformedNode.children;
    return iteratorNode;
  }

  const transformLazy = async (index: number, subNode: Node, path: string[]) => {
    const iteratorNode = innerTree[index];
    const transformedNode = await transformChildNodesLazy(iteratorNode, subNode, path);
    return updateNode(subNode, transformedNode, iteratorNode, path);
  }

  const transform = (index: number, subNode: Node, path: string[]) => {
    const iteratorNode = innerTree[index];
    const transformedNode = transformChildNodes(subNode, path);
    return updateNode(subNode, transformedNode, iteratorNode, path);
  }

  const transformChildNodesLazy = async (mainNode: Node, node: Node, path: string[]): Promise<Node> => {
    let transformedNode = node;

    if (node.lazy) {
      if (!_.isEqual(node.children, [{}])) {
        return node;
      }
      const fetchedChildren = await props.onFetchChildren(mainNode, [...path, node.id]);
      transformedNode = {children: fetchedChildren} as Node;
    }

    return transformChildNodes(transformedNode, path);
  }

  const transformChildNodes = (node: Node, path: string[]): Node => {
    const currentNode = _.cloneDeep(node);
    for (const [index, child] of currentNode.children.entries()) {
      if (!child.transformed) {
        const shouldBeLazy = !!child.children && !child.children.length;
        const transformedChild = props.onTransformNode(child, path);
        transformedChild.children = transformedChild.lazy && shouldBeLazy ? [{} as any] : transformedChild.children;
        transformedChild.id = transformedChild.id || uuid();

        currentNode.children[index] = transformedChild;
      }
    }
    return currentNode;
  }

  const onMenuClick = (subNode: Node, menuIndex: number, path: string[], node: Node) => {
    props.menuOptions[subNode.type][menuIndex].action(node, [...path, subNode.id]);
  };

  const renderTree = (node: Tree, index: number) => {
    return (
      <TreeItem
        node={node}
        menuOptions={props.menuOptions}
        onMenuClick={(subNode, menuIndex, path) => onMenuClick(subNode, menuIndex, path, node)}
        onTransformChildNodesLazy={(subNode, path) => transformLazy(index, subNode, path)}
        onTransformChildNodes={(subNode, path) => transform(index, subNode, path)}
        expandAllNodes={props.expandedNodes}
        onToggleNode={handleToggleNode}
        path={[]}
      />
    )
  };

  return (
    <div className="bi-muted">
      {
        innerTree.length === 0 ?
        null
        : innerTree.map((sub, index) => {
          return (
            <TreeView
              key={sub.id}
              defaultCollapseIcon={<ArrowDropDownIcon data-hook="tree-item-collapse-icon" />}
              defaultExpanded={[]}
              defaultExpandIcon={<ArrowRightIcon data-hook="tree-item-expand-icon" />}
              disableSelection={true}
              expanded={expanded}
            >
              {renderTree(sub, index)}
            </TreeView>
          )
        })
      }
    </div>
  )
}
