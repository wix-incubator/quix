import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {TreeItem, Node} from './TreeItem';

const EXPAND_ALL_NODES_LIMIT = 3000;

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
  highlight: string;
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

const countAllSubChildren = (node: Tree, withLazy: boolean = false, count = 0) => {
  if (!node.children || (!withLazy && node.lazy)) {
    return count;
  }

  const sum = node.children.length;
  const sumChildren = node.children.map(child => countAllSubChildren(child, withLazy, count)).reduce((a, b) => a + b, 0);

  return sum + sumChildren;
}


export const FileExplorer = (props: FileExplorerProps) => {

  const [innerTree, setInnerTree] = useState<Tree[]>([]);

  useEffect(() => {
    const transformedNode = transformChildNodes(
      {
        children: Array.isArray(props.tree) ? props.tree : [props.tree]
      } as Node,
      [],
    );
    setInnerTree(transformedNode.children);
  }, [props.tree]);

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

  return (
    <div className="bi-muted">
      {
        innerTree.length !== 0 ?
        innerTree.map((sub, index) => (
          <TreeItem
            key={sub.id}
            node={sub}
            menuOptions={props.menuOptions}
            onMenuClick={(subNode, menuIndex, path) => onMenuClick(subNode, menuIndex, path, sub)}
            onTransformChildNodesLazy={(subNode, path) => transformLazy(index, subNode, path)}
            onTransformChildNodes={(subNode, path) => transform(index, subNode, path)}
            expandAllNodes={
              props.expandedNodes && countAllSubChildren({children: innerTree} as Node) < EXPAND_ALL_NODES_LIMIT
            }
            path={[]}
            highlight={props.highlight || null}
          />
        )) : null
      }
    </div>
  )
}
