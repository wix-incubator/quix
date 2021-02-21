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

interface NodeProps {
  node: Node;
  menuOptions: {
    [key:string]: {
      title: string;
    }[];
  };
  menuClick(node: Node, menuTypeIndex: number, path: string[]): void;
  transformChildNodes(node: Node, path: string[]): Promise<Node>;
  lazyTransformChildNodes(node: Node, path: string[]): Promise<Node>;
  expand(node: Node): void;
  path: string[];
  startupExpanded: boolean;
}


export const TreeItem = ({
    transformChildNodes,
    lazyTransformChildNodes,
    expand,
    startupExpanded,
    path,
    menuClick,
    node: initialNode,
    menuOptions,
  }: NodeProps) => {
  const classes = useStyles();

  const [node, setNode] = useState<Node>(initialNode);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedFirstTime, setClickedFirstTime] = useState(false);


  useEffect(() => {
    if (!node.lazy && startupExpanded ) {
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
      expand(node);
      return;
    }

    setIsLoading(true);
    let transformedNode;

    if (!node.lazy) {
      transformedNode = await transformChildNodes(node, path);
    } else {
      transformedNode = await lazyTransformChildNodes(node, path);
    }

    setIsLoading(false);
    expand(node);
    setNode(transformedNode);
  }

  return (
    <MaterialTreeItem
      classes={{label: classes.label, content: 'bi-hover', group: classes.group}}
      onIconClick={() => onClick()}
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
            onClick={() => onClick()}
          >
            {node.textIcon ?
              <div className={'bi-text--sm ng-binding ng-scope ' + classes.textIcon}>{node.textIcon}</div>
              : <MaterialIcon className={'bi-icon--xs ' + classes.iconSm}  icon={node.icon || 'hourglass_empty'}/>
            }
            <span className="bi-text--ellipsis">
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
                  onClick={() => menuClick(node, index, path)}
                />
              )}
              
            </Dropdown>
            : null
          }
        </div>
      }
    >
      {
        node.children?.length > 0 || node.lazy === true ? 
        !isLoading ?
          node.children.map(childNode =>
            childNode.id &&
            <TreeItem
              key={childNode.id}
              menuOptions={menuOptions}
              node={childNode}
              transformChildNodes={transformChildNodes}
              lazyTransformChildNodes={lazyTransformChildNodes}
              expand={expand}
              menuClick={menuClick}
              path={[...path, node.id]}
              startupExpanded={!clickedFirstTime ? startupExpanded : false}
            />
          )
        : <div></div>
        : null
      }
    </MaterialTreeItem>
)
}
