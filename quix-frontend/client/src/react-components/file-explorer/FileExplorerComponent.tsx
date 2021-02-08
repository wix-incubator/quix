import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {TreeView, TreeItem} from '@material-ui/lab';
import MaterialIcon from 'material-icons-react';
import { cloneDeep } from 'lodash';
import { MenuItem, Menu } from '@material-ui/core';


const useStyles = makeStyles({
  hover: {
    '&:hover': {
      color: "white",
    },
  },
  group: {
    marginLeft: '12px',
  },
  iconSm: {
    height: '14px',
  },
});

export interface FileExplorerProps {
  tree: RenderTree[];
  transformNode: (node: RenderTree) => RenderTree;
  getLazyChildren?: (node: RenderTree, path: string[]) => Promise<RenderTree[]>;
  onClickMore?: (node: RenderTree, path: string[]) => void;
}

export interface RenderTree {
  id: string;
  name: string;
  type: string;
  lazy?: boolean;
  icon?: string;
  textIcon?: string;
  children?: RenderTree[];
  more?: boolean;
}


const fileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<RenderTree[]>(props.tree);
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
    setInitial(false);
    const updatedTree = innerTree.map(root => props.transformNode(cloneDeep(root)));
    setInnerTree(updatedTree);
  }, []);

  const handleExpanded = (nodeId: string) => {
    const depth = nodeId.split(',').length;
    if (!expanded.includes(nodeId)) {
      setExpanded([...expanded, nodeId]);
    } else {
      const newArr = [];
      expanded.forEach(element => element.split(',').length >= depth ? null : newArr.push(element));
      setExpanded(newArr);
    }
  }

  const transformNode = async (path: string[], treeIndex: number) => {
    const duplicateTree = cloneDeep(innerTree);
    const currentTree = duplicateTree[treeIndex];
    let iteratorNode = currentTree;
    for (let i = 1; i < path.length; i++) {
      const pathAsArray = path[i].split(',');
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.name === pathAsArray[pathAsArray.length - 1]);
    }

    if (_.isEqual(iteratorNode?.children, [{}])) {
      const fixedPath = [];
      path.forEach(part => fixedPath.push(part.split(',')[part.split(',').length - 1]));
      iteratorNode.children = await props.getLazyChildren(iteratorNode, fixedPath);
    }
    else if (iteratorNode) {
      props.transformNode(iteratorNode);
      iteratorNode.children.forEach(
        child => 
          child.lazy && child.children.length === 0 ? child.children = [{} as any]
          : null
      );
    }

    setInnerTree(duplicateTree);
  };

  const renderTree = (node: RenderTree, treeIndex: number, path: string[]) => {
    if (!node.name) {
      return <div>Loading...</div>
    }

    return (
    <TreeItem
      classes={{group: classes.group}}
      key={path.join(',')}
      nodeId={path.join(',')}
      label={
        <>
        <div className={"bi-r-h bi-grow bi-align bi-text " + classes.hover} onClick={() => handleExpanded(path.join(','))}>
          {node.textIcon ?
            <div className="bi-text--sm ng-binding ng-scope">{node.textIcon}</div>
            : <MaterialIcon className={"bi-icon--xs"} icon={node.icon || 'hourglass_empty'}/>
          }
          <span className="bi-text--ellipsis">
            {node.name}
          </span>
        </div>
          {node.more ?
          <>
            <div >
            <MaterialIcon icon='more_vert' onClick={handleClick}/>
            </div>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => {
                    props.onClickMore(node, path);
                    handleClose();
                  }
                }>
                  Select rows (limit 1000)
                </MenuItem>
            </Menu>
          </>
            : null
          }
        </>
      }
    >
      {Array.isArray(node.children) ? node.children.map((node, index) => renderTree(node, treeIndex, [...path, node.name || '' + index])) : null}
    </TreeItem>
  )};

  if (initial) {
    return <>loading</>;
  }

  return (
    <>
      {innerTree.map((sub, index) => {
        return (
          <TreeView
            className="bi-muted"
            key={index}
            defaultCollapseIcon={<ExpandMoreIcon />}
            onNodeToggle={(p, nodeIds: string[]) => transformNode(_.sortBy(nodeIds, nodeId => nodeId.split(',').length), index)}
            defaultExpanded={[]}
            defaultExpandIcon={<ChevronRightIcon />}
            disableSelection={true}
            expanded={expanded}
          >
            {renderTree(sub, index, [sub.name])}
          </TreeView>
        )
      })}
    </>
    )
}

export default fileExplorer;