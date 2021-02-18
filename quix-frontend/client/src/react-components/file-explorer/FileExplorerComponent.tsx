import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {TreeView} from '@material-ui/lab';
import uuid from 'uuid/v4';
import {TreeNode, Node} from './Node';

const useStyles = makeStyles({
  mainView: {
    paddingLeft: '8px',
  },
});

export interface FileExplorerProps {
  tree: Tree[] | Tree;
  transformNode(node: Tree): Tree;
  fetchChildren?(node: Tree, path: string[]): Promise<Tree[]>;
  menuOptions: {
    [key:string]: {
      title: string;
      action(sub: Tree, path: string[]): void;
    }[];
  };
  expanded: boolean;
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

const getAllNodeSubIds = (node: Tree, subIds: string[], withLazy: boolean = true) => {
  if (!node.children) {
    return;
  }

  node.children.map(child => {
    if (child.id && (withLazy || !child.lazy)) {
      subIds.push(child.id);
    }

    getAllNodeSubIds(child, subIds, withLazy);
  })
}

const transformChildNodes = async (node: Node, transformNode: Function, path: string[]): Promise<Node> => {
  const currentNode = _.cloneDeep(node);
  for (const child of currentNode.children) {
    if (!child.transformed) {
      const shouldBeLazy = !!child.children && !child.children.length;
      await transformNode(child, path);
      child.children = child.lazy && shouldBeLazy ? [{} as any] : child.children;
      child.id = child.id || uuid();
    }
  }
  return currentNode;
}

const lazyTransformChildNodes = async (mainNode: Node, node: Node, fetchChildren: Function, transformNode: Function, path: string[]): Promise<Node> => {
  const currentNode = _.cloneDeep(node);
  if (_.isEqual(currentNode.children, [{}])) {
    const transformedChildren = await fetchChildren(mainNode, [...path, node.id]);
    return transformChildNodes({children: transformedChildren} as any, transformNode, path);
  }
  return currentNode;
}


export const FileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<Tree[]>([]);
  const [expanded, setExpanded] = useState([]);
  const [expandNode, setExpandNode] = useState<Node>(null);

  useEffect(() => {
    transformChildNodes(
        {
          children: Array.isArray(props.tree) ? props.tree : [props.tree]
        } as any,
        props.transformNode,
        [],
      )
      .then(transformedNode => setInnerTree(transformedNode.children));
  }, []);

  const expand = (node: Node) => {
    setExpandNode(node);
  }

  useEffect(() => {
    if (!expandNode) {
      return;
    }

    if (!expanded.includes(expandNode.id)) {
      setExpanded([...expanded, expandNode.id]);
    } else {
      const newArr = [];
      const subIds = [expandNode.id];
      getAllNodeSubIds(expandNode, subIds);

      expanded.forEach(element => subIds.includes(element) ? null : newArr.push(element));
      setExpanded(newArr);
    }

    setExpandNode(null);
  }, [expandNode]);

  const transform = async (index: number, subNode: Node, path: string[]) => {
    const transformedNode = await transformChildNodes(subNode, props.transformNode, path);
    const fullPath = [...path, transformedNode.id];

    let iteratorNode = innerTree[index];
  
    for (let i = 1; i < fullPath.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === fullPath[i]);
    }

    iteratorNode.children = transformedNode.children;

    return transformedNode;
  }

  const lazyTransform = async (index: number, subNode: Node, path: string[]) => {
    let iteratorNode = innerTree[index];
    const transformedNode = await lazyTransformChildNodes(iteratorNode, subNode, props.fetchChildren, props.transformNode, path);
    const fullPath = [...path, subNode.id];
  
    for (let i = 1; i < fullPath.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === fullPath[i]);
    }

    iteratorNode.children = transformedNode.children;

    return iteratorNode;
  }

  const onMenuClick = (subNode: Node, menuIndex: number, path: string[], node: Node) => {
    props.menuOptions[subNode.type][menuIndex].action(node, [...path, subNode.id]);
  };

  const renderTree = (node: Tree, index: number) => {
    return (
      <TreeNode
        node={node}
        menuOptions={props.menuOptions}
        menuClick={(subNode: Node, menuIndex: number, path: string[]) => onMenuClick(subNode, menuIndex, path, node)}
        transformChildNodes={(subNode, path) => transform(index, subNode, path)}
        lazyTransformChildNodes={(subNode, path) => lazyTransform(index, subNode, path)}
        startupExpanded={props.expanded}
        expand={expand}
        path={[]}
      />
    )
  };

  return (
    <div className={classes.mainView}>
      {innerTree.map((sub, index) => {
        return (
          <TreeView
            className="bi-muted"
            key={index}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={[]}
            defaultExpandIcon={<ChevronRightIcon />}
            disableSelection={true}
            expanded={expanded}
          >
            {renderTree(sub, index)}
          </TreeView>
        )
      })}
    </div>
  )
}
