import React from 'react';
import {Dropdown} from '../../lib/ui/components/dropdown/Dropdown';

interface TreeItemMenuProps {
  menuOptions: {
    title: string;
  }[];
  onMenuClick(option: {
    title: string;
  }): void;
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
      dynamicWidth={false}
    >
      {(options) => 
        <ul className="bi-dropdown-menu">
          {options.map((option) => 
            <li
              key={option.title}
              onClick={() => {
                onMenuClick(option);
              }}
            >
              {option.title}
            </li>
          )}
        </ul>
      }</Dropdown>
  )
}