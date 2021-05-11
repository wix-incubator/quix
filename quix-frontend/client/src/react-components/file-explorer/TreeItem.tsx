import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Icon from '@material-ui/core/Icon';
import _ from 'lodash';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {Highlighter} from '../../lib/ui/components/Highlighter';
import {Dropdown} from '../../lib/ui/components/dropdown/Dropdown';
import {MenuItem} from '../../lib/ui/components/dropdown/MenuItem';

const useStyles = makeStyles({
  treeItemRoot: {
    fontFamily: 'Open Sans',
  },
  text: {
    height: '35px',
  },
  label: {
    overflow: 'auto',
    paddingRight: '5px',
    paddingLeft: '2px',
  },
  group: {
    marginLeft: 0,
  },
  selected: {
    backgroundColor: 'red',
  },
  iconSm: {
    marginRight: '5px',
    marginTop: '3px',
  },
  textIcon: {
    marginRight: '5px',
    marginLeft: '10px',
  },
  moreVert: {
    fontSize: '30px',
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
  highlight: string;
  expandAllNodes: boolean;
  onMenuClick(node: Node, menuTypeIndex: number, path: string[]): void;
  onTransformChildNodes(node: Node, path: string[]): Node;
  onTransformChildNodesLazy(node: Node, path: string[]): Promise<Node>;
}


const InnerTreeItem = ({
    node: initialNode,
    menuOptions,
    path,
    highlight,
    expandAllNodes,
    onMenuClick,
    onTransformChildNodes,
    onTransformChildNodesLazy,
  }: TreeItemProps) => {
  const classes = useStyles();

  const [node] = useState<Node>(initialNode);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [clickedFirstTime, setClickedFirstTime] = useState(false);

  useEffect(() => {
    if (!node.lazy && expandAllNodes) {
      toggleNode();
    }
  }, []);

  const onClick = async () => {
    if (!expanded) {
      toggleNode();
    } else {
      setExpanded(false);
    }
    if (!clickedFirstTime) {
      setClickedFirstTime(true);
    }
  }

  const toggleNode = async () => {
    setExpanded(true);
    if (!node.children || !node.children.find(child => !child.transformed)) {
      return;
    }

    if (node.lazy) {
      setIsLoading(true);
      const transformedNode = await onTransformChildNodesLazy(node, path);
      node.children = transformedNode.children;
      setIsLoading(false);
    } else {
      const transformedNode = onTransformChildNodes(node, path);
      node.children = transformedNode.children;
    }
  }

  const preIcon = (
    isLoading ? 
      <span className={'bi-align ' + classes.iconSm}>
        <span data-hook="tree-item-loading-icon" className="bi-align bi-spinner--xs">
        </span>
      </span>
    : Array.isArray(node.children) ?
        expanded ?
          <ArrowDropDownIcon data-hook="tree-item-opened-icon" className={'bi-icon--sm ' + classes.iconSm} />
        : <ArrowRightIcon data-hook="tree-item-closed-icon" className={'bi-icon--sm ' + classes.iconSm} />
      : null
  )

  const describeIcon = (
    node.textIcon ?
      <div className={'bi-text--sm ng-binding ng-scope ' + classes.textIcon}>{node.textIcon}</div>
    : <Icon className={'bi-icon--xs ' + classes.iconSm} >{node.icon || 'hourglass_empty'}</Icon>
  )

  const menu = (
    menuOptions[node.type] ?
      <Dropdown
        icon={<MoreVertIcon classes={{root: classes.moreVert}} className={'bi-action'} />}
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
  )

  const getText = () => {
    if (highlight && node.children) {
        return (
        <Highlighter
          term={node.name}
          filter={highlight}
        />
      );
    }
    return node.name;
  }

  return (
    <div>
      <div className={`bi-align bi-hover bi-fade-in bi-pointer fe-item-depth-${path.length} ${classes.treeItemRoot}`}>
        <div
          className={'bi-align bi-r-h bi-text--ellipsis bi-grow bi-text ' + classes.text}
          onClick={() => onClick()}
        >
          {preIcon}
          {describeIcon}

          <span data-hook="tree-item-content" className="bi-text--ellipsis">
            {getText()}
          </span>
        </div>

        {menu}
      </div>
      {
        expanded && !isLoading ? 
          node.children?.map(childNode =>
            childNode.id &&
            <InnerTreeItem
              key={childNode.id}
              menuOptions={menuOptions}
              node={childNode}
              onTransformChildNodes={onTransformChildNodes}
              onTransformChildNodesLazy={onTransformChildNodesLazy}
              onMenuClick={onMenuClick}
              path={[...path, node.id]}
              expandAllNodes={!clickedFirstTime ? expandAllNodes : false}
              highlight={highlight}
            />
          )
        : null
      }
    </div>
  )
}

function TreeItemPropsAreEqual(prevProps, nextProps) {
  const prevNode: Node = prevProps.node;
  const nextNode: Node = nextProps.node;
  
  return prevNode.id === nextNode.id;
}

export const TreeItem = React.memo(InnerTreeItem, TreeItemPropsAreEqual);