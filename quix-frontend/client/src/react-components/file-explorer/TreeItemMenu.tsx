import React, {useRef} from 'react';
import {Dropdown} from '../../lib/ui/components/dropdown/Dropdown';
import {useOutsideAlerter} from '../../services/hooks';

interface TreeItemMenuProps {
  menuOptions: {
    title: string;
  }[];
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  onMenuClick(index: number): void;
}


export const TreeItemMenu = ({
  menuOptions,
  isOpen,
  setIsOpen,
  onMenuClick,
}: TreeItemMenuProps) => {
  const iconRef = useRef(null);
  const menuWrapperRef = useRef(null);
  useOutsideAlerter([iconRef, menuWrapperRef], () => setIsOpen(false));

  return (
    <Dropdown
      OptionsWrapper={({options}: any) =>
        <ul
          ref={menuWrapperRef}
          className="bi-dropdown-menu bi-tree-item-dropdown bi-fade-in"
        >
          {options}
        </ul>
      }
      element={
        <i className="bi-action bi-icon"
          ref={iconRef}
          onClick={() => setIsOpen(!isOpen)}
        >
          more_vert
        </i>}
      isOpen={isOpen}
      options={menuOptions.map((moreOption, index) => 
        <li
          key={moreOption.title}
          onClick={() => {
            onMenuClick(index);
            setIsOpen(false);
          }}
        >
          {moreOption.title}
        </li>
      )}
      placement="bottom-end"
    />
  )
}