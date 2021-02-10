import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {TreeView, TreeItem} from '@material-ui/lab';
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
  onClickMore?(node: Tree, path: string[]): void;
}

export interface Tree {
  id: string;
  name: string;
  type: string;
  lazy?: boolean;
  icon?: string;
  textIcon?: string;
  children?: Tree[];
  more?: boolean;
}


const fileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<Tree[]>(Array.isArray(props.tree) ? props.tree : [props.tree]);
  const [subTree, setSubTree] = useState<{sub: Tree; index: number}>();
  const [initial, setInitial] = useState(true);
  const [expanded, setExpanded] = useState([]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const updatedTree = innerTree.map(root => props.transformNode(_.cloneDeep(root)));
    setInnerTree(updatedTree);
    setInitial(false);
  }, []);

  useEffect(() => {
    if (!subTree) {
      return;
    }
    const duplicatedTree = _.cloneDeep(innerTree);
    duplicatedTree[subTree.index] = _.mergeWith({}, duplicatedTree[subTree.index], subTree.sub);
    setInnerTree(duplicatedTree)
  }, [subTree]);

  const handleExpanded = (nodeId: string, sub: Tree, subIndex: number) => {
    if (!expanded.includes(nodeId)) {
      setExpanded([...expanded, nodeId]);
      transformNode(nodeId.split(','), sub, subIndex);
    } else {
      const newArr = [];
      expanded.forEach(element => element.includes(nodeId) ? null : newArr.push(element));
      setExpanded(newArr);
    }
  }

  const transformNode = async (path: string[], sub: Tree, subIndex: number) => {
    const currentTree = _.cloneDeep(sub);
    let iteratorNode = currentTree;
    for (let i = 1; i < path.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.name === path[i]);
    }

    if (_.isEqual(iteratorNode?.children, [{}])) {
      const fixedPath = [];
      path.forEach(part => fixedPath.push(part.split(',')[part.split(',').length - 1]));
      iteratorNode.children = await props.fetchChildren(iteratorNode, fixedPath);
    } else if (iteratorNode?.children) {
      props.transformNode(iteratorNode);
      iteratorNode.children.forEach(
        child =>
          child.lazy && child.children.length === 0 ? child.children = [{} as any]
          : null
      );
    }

    setSubTree({sub: currentTree, index: subIndex});
  };

  const renderTree = (node: Tree, path: string[], sub: Tree, subIndex: number) => {
    const uniquePath = path.join(',');
    if (!node.name) {
      return;
    }

    // dont use name as id
    // create MenuItem

    // check is transformed already

    const isLoading = 
      node.children && node.children[0] ?
          !node?.children[0].name && expanded.includes(uniquePath)
          : false;

    return (
    <TreeItem
      classes={{label: classes.label, content: 'bi-hover', group: classes.group}}
      onIconClick={() => handleExpanded(uniquePath, sub, subIndex)}
      icon={isLoading ?
        <span>
          <span className="bi-spinner--xs">
          </span>
        </span>
      : null
      }
      key={uniquePath}
      nodeId={uniquePath}
      label={
        <div className={'bi-align ' + classes.treeItemRoot}>
          <div
            className={'bi-align bi-r-h bi-text--ellipsis bi-grow bi-text ' + classes.text}
            onClick={() => handleExpanded(uniquePath, sub, subIndex)}
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
              <div>
                <MaterialIcon className={'bi-action bi-icon'} icon='more_vert' onClick={handleClick} />
              </div>
              <Dropdown
                open={Boolean(anchorEl)}
                handleClose={handleClose}
                referenceElement={anchorEl}
              >
                <SelectItem
                  text="Select rows (limit 1000)"
                  onClick={() => props.onClickMore(node, path)}
                />
              </Dropdown>
            </>
            : null
          }
        </div>
      }
    >
      {
        Array.isArray(node.children) ?
          node.children.map(
            (childNode, index) => 
              renderTree(
                childNode,
                [
                  ...path,
                  childNode.name || '' + index
                ],
                sub,
                subIndex
              )
            )
          : null}
    </TreeItem>
  )};

  if (initial) {
    return (<div>Loading...</div>);
  }

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
            {renderTree(sub, [sub.name], sub, index)}
          </TreeView>
        )
      })}
    </div>
  )
}

export default fileExplorer;