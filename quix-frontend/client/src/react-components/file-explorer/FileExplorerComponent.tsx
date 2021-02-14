import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {TreeView, TreeItem} from '@material-ui/lab';
import uuid from 'uuid/v4';
import MaterialIcon from 'material-icons-react';
import Dropdown from '../../lib/ui/components/dropdown/Dropdown';
import SelectItem from '../../lib/ui/components/dropdown/MenuItem';

const useStyles = makeStyles({
  mainView: {
    paddingLeft: '8px',
  },
  treeItemRoot: {
    fontFamily: 'Open Sans',
  },
  text: {
    height: '35px',
    '&:hover': {
      color: 'white',
    },
  },
  label: {
    overflow: 'auto',
    paddingRight: '5px',
    paddingLeft: '2px',
  },
  group: {
    marginLeft: '10px'
  },
  iconSm: {
    marginRight: '5px',
    marginTop: '3px',
  },
  textIcon: {
    marginRight: '5px',
  }
});

export interface FileExplorerProps {
  tree: Tree[] | Tree;
  transformNode(node: Tree): Tree;
  fetchChildren?(node: Tree, path: string[]): Promise<Tree[]>;
  moreOptions: {
    [key:string]: {
      title: string,
      action(sub: Tree, path: string[]): void,
    }[]
  }
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
  more?: boolean;
}

const recursiveTransformNode = (tree: Tree[], transformNode: Function) => {
  const entrances = Object.keys(tree);
  if (entrances.length === 0 || _.isEqual(tree, [{}])) {
    return;
  }

  entrances.map(key => {
    const currentTree: Tree = tree[key];
    if (!currentTree.transformed) {
      const shouldBeLazy = !!currentTree.children && !currentTree.children.length;
      transformNode(currentTree);
      currentTree.children = currentTree.lazy && shouldBeLazy ? currentTree.children = [{} as any] : currentTree.children;
      currentTree.id = currentTree.id || uuid();
    }
    currentTree.children && recursiveTransformNode(currentTree.children, transformNode);
  });
}

const getAllNodeSubIds = (node: Tree, subIds: string[]) => {
  if (!node.children) {
    return;
  }
  node.children.map(child => {
    subIds.push(child.id);
    getAllNodeSubIds(child, subIds);
  })
}


const fileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<Tree[]>(Array.isArray(props.tree) ? props.tree : [props.tree]);
  const [subTree, setSubTree] = useState<{sub: Tree; index: number}>();
  const [expanded, setExpanded] = useState([]);

  useEffect(() => {
    const currentTree = _.cloneDeep(innerTree);
    recursiveTransformNode(currentTree, props.transformNode);
    if (!_.isEqual(innerTree, currentTree)) {
      setInnerTree(currentTree);
    }
  }, [innerTree]);

  useEffect(() => {
    if (!subTree) {
      return;
    }
    const duplicatedTree = _.cloneDeep(innerTree);
    duplicatedTree[subTree.index] = _.mergeWith({}, duplicatedTree[subTree.index], subTree.sub);
    setInnerTree(duplicatedTree)
  }, [subTree]);

  const handleExpanded = (nodeId: string, path: string[], sub: Tree, subIndex: number, node: Tree) => {
    if (!expanded.includes(nodeId)) {
      setExpanded([...expanded, nodeId]);
      transformNode(path, sub, subIndex);
    } else {
      const newArr = [];
      const subIds = [node.id];
      getAllNodeSubIds(node, subIds);

      expanded.forEach(element => subIds.includes(element) ? null : newArr.push(element));
      setExpanded(newArr);
    }
  }

  const transformNode = async (path: string[], sub: Tree, subIndex: number) => {
    const currentTree = _.cloneDeep(sub);
    let iteratorNode = currentTree;
    for (let i = 1; i < path.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === path[i]);
    }

    if (_.isEqual(iteratorNode?.children, [{}])) {
      const fixedPath = [];
      path.forEach(part => fixedPath.push(part.split(',')[part.split(',').length - 1]));
      iteratorNode.children = await props.fetchChildren(sub, fixedPath);
    }

    setSubTree({sub: currentTree, index: subIndex});
  };

  const renderTree = (node: Tree, path: string[], sub: Tree, subIndex: number) => {
    if (!node.id) {
      return;
    }

    const isLoading = 
      node.children && node.children[0] ?
          !node?.children[0].name && expanded.includes(node.id)
          : false;

    const moreOptions = node.more && props.moreOptions[node.type];

    return (
    <TreeItem
      classes={{label: classes.label, content: 'bi-hover', group: classes.group}}
      onIconClick={() => handleExpanded(node.id, path, sub, subIndex, node)}
      icon={isLoading ?
        <span>
          <span className="bi-spinner--xs">
          </span>
        </span>
      : null
      }
      key={node.id}
      nodeId={node.id}
      label={
        <div className={'bi-align ' + classes.treeItemRoot}>
          <div
            className={'bi-align bi-r-h bi-text--ellipsis bi-grow bi-text ' + classes.text}
            onClick={() => handleExpanded(node.id, path, sub, subIndex, node)}
          >
            {node.textIcon ?
              <div className={'bi-text--sm ng-binding ng-scope ' + classes.textIcon}>{node.textIcon}</div>
              : <MaterialIcon className={'bi-icon--xs ' + classes.iconSm}  icon={node.icon || 'hourglass_empty'}/>
            }
            <span className="bi-text--ellipsis">
              {node.name}
            </span>
          </div>
          {node.more ?
            <>
              <Dropdown
                icon={<MaterialIcon className={'bi-action bi-icon'} icon='more_vert' />}
                placement='bottom-end'
              >
                {moreOptions.map((moreOption, index) => 
                  <SelectItem
                    key={index}
                    text={moreOption.title}
                    onClick={() => {
                      moreOption.action(sub, path)
                    }}
                  />
                )}
                
              </Dropdown>
            </>
            : null
          }
        </div>
      }
    >
      {
        Array.isArray(node.children) ?
          node.children.map(childNode =>
              renderTree(
                childNode,
                [
                  ...path,
                  childNode.id,
                ],
                sub,
                subIndex,
              )
            )
          : null}
    </TreeItem>
  )};

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
            {renderTree(sub, [sub.id], sub, index)}
          </TreeView>
        )
      })}
    </div>
  )
}

export default fileExplorer;