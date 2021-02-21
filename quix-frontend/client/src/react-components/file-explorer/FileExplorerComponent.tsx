import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
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
  transformNode(node: Tree, path: string[]): Tree;
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


export const FileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<Tree[]>([]);
  const [expanded, setExpanded] = useState([]);
  const [expandNode, setExpandNode] = useState<Node>(null);

  useEffect(() => {
    const transformedNode = transformChildNodes(
      {
        children: Array.isArray(props.tree) ? props.tree : [props.tree]
      } as any,
      [],
    );
    
    setInnerTree(transformedNode.children);
  }, []);

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

  const transform = (index: number, subNode: Node, path: string[]) => {
    const transformedNode = transformChildNodes(subNode, path);
    const fullPath = [...path, transformedNode.id];

    let iteratorNode = innerTree[index];
  
    for (let i = 1; i < fullPath.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === fullPath[i]);
    }

    iteratorNode.children = transformedNode.children;

    return transformedNode;
  }

  const transformChildNodes = (node: Node, path: string[]): Node => {
    const currentNode = _.cloneDeep(node);
    for (const [index, child] of currentNode.children.entries()) {
      if (!child.transformed) {
        const shouldBeLazy = !!child.children && !child.children.length;
        const transformedChild = props.transformNode(child, path);
        transformedChild.children = transformedChild.lazy && shouldBeLazy ? [{} as any] : transformedChild.children;
        transformedChild.id = transformedChild.id || uuid();
  
        currentNode.children[index] = transformedChild;
      }
    }
    return currentNode;
  }

  const lazyTransform = async (index: number, subNode: Node, path: string[]): Promise<Tree> => {
    let iteratorNode = innerTree[index];
    const transformedNode = await lazyTransformChildNodes(iteratorNode, subNode, path);
    const fullPath = [...path, subNode.id];
  
    for (let i = 1; i < fullPath.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === fullPath[i]);
    }

    iteratorNode.children = transformedNode.children;
    return iteratorNode;
  }

  const lazyTransformChildNodes = async (mainNode: Node, node: Node, path: string[]): Promise<Node> => {
    if (_.isEqual(node.children, [{}])) {
      const transformedChildren = await props.fetchChildren(mainNode, [...path, node.id]);
      return transformChildNodes({children: transformedChildren} as any, path);
    }
    return node;
  }

  const onMenuClick = (subNode: Node, menuIndex: number, path: string[], node: Node) => {
    props.menuOptions[subNode.type][menuIndex].action(node, [...path, subNode.id]);
  };

  const renderTree = (node: Tree, index: number) => {
    return (
      <TreeItem
        node={node}
        menuOptions={props.menuOptions}
        menuClick={(subNode, menuIndex, path) => onMenuClick(subNode, menuIndex, path, node)}
        transformChildNodes={(subNode, path) => transform(index, subNode, path)}
        lazyTransformChildNodes={(subNode, path) => lazyTransform(index, subNode, path)}
        startupExpanded={props.expanded}
        expand={setExpandNode}
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
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpanded={[]}
              defaultExpandIcon={<ChevronRightIcon />}
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
