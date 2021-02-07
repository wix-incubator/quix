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
}

export interface RenderTree {
  id: string;
  name: string;
  type: string;
  lazy?: boolean;
  icon?: string;
  children?: RenderTree[];
}

const doSomething = (nodes: RenderTree, treeIndex: number) => {
};


const fileExplorer = (props: FileExplorerProps) => {
  const classes = useStyles();

  const [innerTree, setInnerTree] = useState<RenderTree[]>(props.tree);
  const [initial, setInitial] = useState(true);

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
        iteratorNode = iteratorNode.children.find(nodeProps => nodeProps.name === path[i]);
    }
    if (_.isEqual(iteratorNode?.children, [{}])) {
      iteratorNode.children = await props.getLazyChildren(iteratorNode, path);
    } else if (iteratorNode) {
      props.transformNode(iteratorNode);
      iteratorNode.children.forEach(
        child => 
          child.lazy ? child.children = [{} as any]
          : null
      );
    }
    setInnerTree(duplicateTree);
  };

  const renderTree = (nodes: RenderTree, treeIndex: number) => {
    if (!nodes.name) {
      return 'loading'
    }
    
    return (
    <TreeItem
      classes={{group: classes.group}}
      key={nodes.name}
      nodeId={nodes.name}
      label={
        <div className={"bi-r-h bi-grow bi-align bi-text " + classes.hover}>
          <MaterialIcon className={"bi-icon--xs"} icon={nodes.icon || 'hourglass_empty'}/>
          <span className="bi-text--ellipsis">
            {nodes.name}
          </span>
            {nodes.type === 'table' ?
              <MoreVertIcon
                onClick={() => doSomething(nodes, treeIndex)}
              />
              : null
            }
        </div>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node, treeIndex)) : null}
    </TreeItem>
  )};

  if (initial) {
    return <>loading</>;
  }

  return (
    <>
      {innerTree.map((sub, index) => {
        // await props.transformNode(sub);
        return (
          <TreeView
            className="bi-muted"
            key={index}
            defaultCollapseIcon={<ExpandMoreIcon />}
            onNodeToggle={(p, nodeIds: string[]) => transformNode(nodeIds, index)}
            defaultExpanded={[]}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTree(sub, index)}
          </TreeView>
        )
      })}
    </>
    )
}

export default fileExplorer;