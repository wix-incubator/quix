import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {TreeView} from '@material-ui/lab';
import uuid from 'uuid/v4';
import {TreeItem, Node} from './TreeItem';

const useStyles = makeStyles({
  mainView: {
    paddingLeft: '8px',
  },
});

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

// const getAllNodeSubIds = (node: Tree, subIds: string[], withLazy: boolean = true) => {
const getAllNodeSubIds = (node: Tree, subIds: string[] = [], withLazy: boolean = true) => {
  if (!node.children) {
    return subIds;
    // return;
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
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<Tree[]>([]);
  const [expanded, setExpanded] = useState([]);
  const [expandNode, setExpandNode] = useState<Node>(null);

  useEffect(() => {
    transformChildNodes(
      null,
      {
        children: Array.isArray(props.tree) ? props.tree : [props.tree]
      } as Node,
      [],
    ).then(transformedNode => setInnerTree(transformedNode.children));
  }, [props.tree]);

  useEffect(() => {
    if (!expandNode) {
      return;
    }

    if (!expanded.includes(expandNode.id)) {
      setExpanded([...expanded, expandNode.id]);
    } else {
      const newArr = [];
      const subIds = getAllNodeSubIds(expandNode, [expandNode.id]);

      expanded.forEach(element => subIds.includes(element) ? null : newArr.push(element));
      setExpanded(newArr);
    }

    setExpandNode(null);
  }, [expandNode]);

  const handleToggleNode = (node: Node) => {
    setExpandNode(node);
  }

  const transform = async (index: number, subNode: Node, path: string[]) => {
    let iteratorNode = innerTree[index];
    
    const transformedNode = await transformChildNodes(iteratorNode, subNode, path);
    
    const fullPath = [...path, transformedNode.id || subNode.id];
  
    for (let i = 1; i < fullPath.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === fullPath[i]);
    }

    iteratorNode.children = transformedNode.children;
    return iteratorNode;
  }

  const transformChildNodes = async (mainNode: Node, node: Node, path: string[]): Promise<Node> => {
    let transformedNode = node;

    if (node.lazy) {
      if (!_.isEqual(node.children, [{}])) {
        return node;
      }
      const fetchedChildren = await props.onFetchChildren(mainNode, [...path, node.id]);
      transformedNode = {children: fetchedChildren} as Node;
    }

    const currentNode = _.cloneDeep(transformedNode);
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
        onTransformChildNodes={(subNode, path) => transform(index, subNode, path)}
        expandAllNodes={props.expandedNodes}
        onToggleNode={handleToggleNode}
        path={[]}
      />
    )
  };

  return (
    <div className={'bi-muted ' + classes.mainView}>
      {
        innerTree.length === 0 ?
        'Loading...'
        : innerTree.map((sub, index) => {
          return (
            <TreeView
              key={sub.id}
              defaultCollapseIcon={<ArrowDropDownIcon />}
              defaultExpanded={[]}
              defaultExpandIcon={<ArrowRightIcon />}
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
