import './FileExplorerComponent.scss';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {TreeView, TreeItem} from '@material-ui/lab';
import MaterialIcon from 'material-icons-react';
import Dropdown from '../../lib/ui/components/Dropdown';

const useStyles = makeStyles({
  root: {
    fontFamily: 'Open Sans',
  },
  text: {
    height: '35px',
    '&:hover': {
      color: "white",
    },
  },
  label: {
    overflow: 'auto',
    paddingRight: '5px',
  },
  iconSm: {
    height: '14px',
  },
});

export interface FileExplorerProps {
  tree: RenderTree[];
  transformNode(node: RenderTree): RenderTree;
  getLazyChildren?(node: RenderTree, path: string[]): Promise<RenderTree[]>;
  onClickMore?(node: RenderTree, path: string[]): void;
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
    const updatedTree = innerTree.map(root => props.transformNode(_.cloneDeep(root)));
    setInnerTree(updatedTree);
  }, []);

  const handleExpanded = (nodeId: string, sub: RenderTree, subIndex: number) => {
    if (!expanded.includes(nodeId)) {
      setExpanded([...expanded, nodeId]);
      transformNode(nodeId.split(','), sub, subIndex);
    } else {
      const newArr = [];
      expanded.forEach(element => element.includes(nodeId) ? null : newArr.push(element));
      setExpanded(newArr);
    }
  }

  const transformNode = async (path: string[], sub: RenderTree, subIndex: number) => {
    const currentTree = _.cloneDeep(sub);
    let iteratorNode = currentTree;
    for (let i = 1; i < path.length; i++) {
      iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.name === path[i]);
    }

    if (_.isEqual(iteratorNode?.children, [{}])) {
      const fixedPath = [];
      path.forEach(part => fixedPath.push(part.split(',')[part.split(',').length - 1]));
      iteratorNode.children = await props.getLazyChildren(iteratorNode, fixedPath);
    }
    else if (iteratorNode?.children) {
      props.transformNode(iteratorNode);
      iteratorNode.children.forEach(
        child => 
          child.lazy && child.children.length === 0 ? child.children = [{} as any]
          : null
      );
    }

    const duplicateTree = _.cloneDeep(innerTree);
    duplicateTree[subIndex] = currentTree;
    setInnerTree(duplicateTree);
  };

  const renderTree = (node: RenderTree, path: string[], sub: RenderTree, subIndex: number) => {
    const uniquePath = path.join(',');
    if (!node.name) {
      return (<div key={uniquePath}>Loading...</div>);
    }

    return (
    <TreeItem
      classes={{label: classes.label, content: "bi-hover"}}
      onIconClick={() => handleExpanded(uniquePath, sub, subIndex)}
      key={uniquePath}
      nodeId={uniquePath}
      label={
        <div className={"bi-align " + classes.root}>
          <div
            className={"bi-align bi-s-h bi-text--ellipsis bi-grow bi-text " + classes.text}
            onClick={() => handleExpanded(uniquePath, sub, subIndex)}
          >
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
              <div>
                <MaterialIcon className={'bi-action bi-icon'} icon='more_vert' onClick={handleClick} />
              </div>
              <Dropdown
                open={Boolean(anchorEl)}
                handleClose={handleClose}
                referenceElement={anchorEl}
              >
                <div
                  onClick={() => props.onClickMore(node, path)}
                >
                  Select rows (limit 1000)
                </div>
              </Dropdown>
            </>
            : null
          }
        </div>
      }
    >
      {
        Array.isArray(node.children) ?
        _.orderBy(node.children, [child => child.name?.toLowerCase()], ['asc']).map(
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
    return (<div>loading</div>);
  }

  return (
    <>
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
    </>
    )
}

export default fileExplorer;