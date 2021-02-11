import React, {useEffect, useRef} from 'react';
import Popper, {PopperPlacementType} from "@material-ui/core/Popper";
import { Grow, Paper, ClickAwayListener, MenuList } from '@material-ui/core';

interface IDropdownProps {
  icon: React.ReactNode;
  placement: PopperPlacementType;
}


const Dropdown: React.FunctionComponent<IDropdownProps> = ({
  children,
  icon,
  placement,
}) => {

  const refElement = useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

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
  
  const open = Boolean(anchorEl);

  if (!Array.isArray(children)) {
    children = [children];
  }

  if (Array.isArray(children)) {
    return (
      <>
        <div ref={refElement} onClick={handleClick}>
          {icon}
        </div>
        <Popper open={open} anchorEl={anchorEl} transition placement={placement}>
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
      </>
    )
  }
}


export default Dropdown;