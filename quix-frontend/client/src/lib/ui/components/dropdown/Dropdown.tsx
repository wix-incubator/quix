import React, {useEffect} from 'react';
import Popper from "@material-ui/core/Popper";
import { Grow, Paper, ClickAwayListener, MenuList } from '@material-ui/core';

interface IDropdownProps {
  open: boolean,
  handleClose: Function,
  referenceElement: HTMLElement,
}


const Dropdown: React.FunctionComponent<IDropdownProps> = ({
  open,
  handleClose,
  referenceElement,
  children,
}) => {
  if (!open) {
    return null;
  }

  const escFunction = (e) => {
    if (e.keyCode === 27) {
      handleClose();
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, []);

  if (!Array.isArray(children)) {
    children = [children];
  }

  if (Array.isArray(children)) {
    return (
      <Popper open={open} anchorEl={referenceElement} transition placement='bottom-end'>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom"
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={() => handleClose()}>
                <MenuList>
                  {children}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    )
  }
}


export default Dropdown;