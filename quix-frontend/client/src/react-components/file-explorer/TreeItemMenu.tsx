import React from 'react';
import {Dropdown} from '../../lib/ui/components/dropdown/Dropdown';

interface TreeItemMenuProps {
  menuOptions: {
    title: string;
  }[];
  onMenuClick(index: number): void;
}


export const TreeItemMenu = ({
  menuOptions,
  onMenuClick,
}: TreeItemMenuProps) => {

  return (
    <Dropdown
      toggle={(p) => 
        <i {...p} className="bi-action bi-icon">
          more_vert
        </i>}
      placement="bottom-end"
      options={menuOptions}
    >
      {(options) => 
        <ul className="bi-dropdown-menu bi-tree-item-dropdown bi-fade-in">
          {options.map((option, index) => 
            <li
              key={option.title}
              onClick={() => {
                onMenuClick(index);
              }}
            >
              {option.title}
            </li>
          )}
        </ul>
      }</Dropdown>
  )
}