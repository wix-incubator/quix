import React, { useEffect, useState } from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {TreeItem as MaterialTreeItem} from '@material-ui/lab';
import MaterialIcon from 'material-icons-react';
import {Dropdown} from '../../lib/ui/components/dropdown/Dropdown';
import {MenuItem} from '../../lib/ui/components/dropdown/MenuItem';

const useStyles = makeStyles({
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

export interface Node {
  id: string;
  name: string;
  type: string;
  transformed: boolean;
  lazy?: boolean;
  icon?: string;
  textIcon?: string;
  children?: Node[];
  more?: boolean;
}

interface TreeItemProps {
  node: Node;
  menuOptions: {
    [key:string]: {
      title: string;
    }[];
  };
  path: string[];
  // expandedNodes: string[];
  expandAllNodes: boolean;
  onToggleNode(node: Node): void;
  onMenuClick(node: Node, menuTypeIndex: number, path: string[]): void;
  onTransformChildNodes(node: Node, path: string[]): Promise<Node> | Node;
}


export const TreeItem = ({
    node: initialNode,
    menuOptions,
    path,
    expandAllNodes,
    onToggleNode,
    onMenuClick,
    onTransformChildNodes,
  }: TreeItemProps) => {
  const classes = useStyles();

  const [node, setNode] = useState<Node>(initialNode);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedFirstTime, setClickedFirstTime] = useState(false);

  useEffect(() => {
    if (!node.lazy && expandAllNodes) {
      toggleNode();
    }
  }, []);

  const onClick = async () => {
    if (!clickedFirstTime) {
      setClickedFirstTime(true);
    }
    toggleNode();
  }

  const toggleNode = async () => {
    if (!node.children) {
      return;
    }

    if (!node.children.find(child => !child.transformed)) {
      onToggleNode(node);
      return;
    }

    setIsLoading(true);

    const transformedNode = await onTransformChildNodes(node, path);

    setIsLoading(false);
    onToggleNode(node);
    setNode(transformedNode);
  }

  return (
    <MaterialTreeItem
      classes={{label: classes.label, content: 'bi-hover', group: classes.group}}
      onIconClick={() => onClick()}
      icon={isLoading ?
        <span>
          <span data-hook="tree-item-loading-icon" className="bi-spinner--xs">
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
            onClick={() => onClick()}
          >
            {node.textIcon ?
              <div className={'bi-text--sm ng-binding ng-scope ' + classes.textIcon}>{node.textIcon}</div>
              : <MaterialIcon className={'bi-icon--xs ' + classes.iconSm} icon={node.icon || 'hourglass_empty'} />
            }
            <span data-hook="tree-item-content" className="bi-text--ellipsis">
              {node.name}
            </span>
          </div>
          {menuOptions[node.type] ?
            <Dropdown
              icon={<MaterialIcon className={'bi-action bi-icon'} icon='more_vert' />}
              placement='bottom-end'
            >
              {menuOptions[node.type].map((moreOption, index) => 
                <MenuItem
                  key={index}
                  text={moreOption.title}
                  onClick={() => onMenuClick(node, index, path)}
                />
              )}
              
            </Dropdown>
            : null
          }
        </div>
      }
    >
      {
        (node.children?.length > 0 || node.lazy === true) && !isLoading ? 
          node.children.map(childNode =>
            childNode.id &&
            <TreeItem
              key={childNode.id}
              menuOptions={menuOptions}
              node={childNode}
              onTransformChildNodes={onTransformChildNodes}
              onToggleNode={onToggleNode}
              onMenuClick={onMenuClick}
              path={[...path, node.id]}
              expandAllNodes={!clickedFirstTime ? expandAllNodes : false}
            />
          )
        : null
      }
    </MaterialTreeItem>
  )
}
