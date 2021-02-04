import './FileExplorerComponent.scss';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import BookIcon from '@material-ui/icons/Book';
import StorageIcon from '@material-ui/icons/Storage';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import {TreeView, TreeItem} from '@material-ui/lab';

const useStyles = makeStyles({
  root: {
  },
  none: {},
});

export interface FileExplorerProps {
  fooBar: string;
}

interface RenderTree {
  id: string;
  name: string;
  type: string;
  children?: RenderTree[];
}

const data: RenderTree = {
  id: 'root',
  name: 'Parent',
  type: 'catalog',
  children: [
    {
      id: '1',
      name: 'Child - 1',
      type: 'schema',
    },
    {
      id: '3',
      name: 'Child - 3',
      type: 'schema',
      children: [
        {
          id: '4',
          name: 'Child - 4',
          type: 'table',
        },
      ],
    },
  ],
};


const fileExplorer = (props: FileExplorerProps) => {
  console.log(props);
  const classes = useStyles();

  const renderTree = (nodes: RenderTree) => {
    let LabelIcon;
    switch(nodes.type) {
      case 'catalog':
        LabelIcon = BookIcon;
        break;
      case 'schema':
        LabelIcon = StorageIcon;
        break;
      default:
        LabelIcon = ViewModuleIcon;
        break;
    }
    return (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={
        <div className="bi-r-h bi-grow bi-text">
          <LabelIcon classes={{root:classes.root}}/>
          <span>
            {nodes.name}
          </span>
            {nodes.type === 'table' ? <MoreVertIcon /> : null}
        </div>
      }
      
      endIcon={<MoreVertIcon />}
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
    )};

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={[]}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {renderTree(data)}
    </TreeView>
  );
}

export default fileExplorer;