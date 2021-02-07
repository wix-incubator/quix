import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MoreVertIcon from '@material-ui/icons/MoreVert';
// import BookIcon from '@material-ui/icons/Book';
// import StorageIcon from '@material-ui/icons/Storage';
// import ViewModuleIcon from '@material-ui/icons/ViewModule';
import {TreeView, TreeItem} from '@material-ui/lab';
import MaterialIcon from 'material-icons-react';
import { cloneDeep } from 'lodash';
import { MenuItem, Button, Menu } from '@material-ui/core';


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
  children?: RenderTree[];
  more?: boolean;
}


const fileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<RenderTree[]>(props.tree);
  const [initial, setInitial] = useState(true);

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

  const transformNode = async (path: string[], treeIndex: number) => {
    const duplicateTree = cloneDeep(innerTree);
    const currentTree = duplicateTree[treeIndex];
    let iteratorNode = currentTree;
    for (let i = path.length - 2; i > -1; i--){
        iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.name === path[i]);
    }

    if (_.isEqual(iteratorNode?.children, [{}])) {
      iteratorNode.children = await props.getLazyChildren(iteratorNode, path.reverse());
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


    let more;
    return (
    <TreeItem
      classes={{group: classes.group}}
      key={path.join(',')}
      nodeId={node.name}
      label={
        <div className={"bi-r-h bi-grow bi-align bi-text " + classes.hover}>
          <MaterialIcon className={"bi-icon--xs"} icon={node.icon || 'hourglass_empty'}/>
          <span className="bi-text--ellipsis">
            {node.name}
          </span>
            {node.more ?
            <>
              <Button onClick={handleClick}>
                <MoreVertIcon />
              </Button>
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
            {more}
        </div>
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
            onNodeToggle={(p, nodeIds: string[]) => transformNode(nodeIds, index)}
            defaultExpanded={[]}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTree(sub, index, [sub.name])}
          </TreeView>
        )
      })}
    </>
    )
}

export default fileExplorer;