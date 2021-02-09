import React from 'react';
import Popper from "@material-ui/core/Popper";
import { Grow, Paper, ClickAwayListener, MenuList, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
  root: {
    fontFamily: 'Open Sans',
    fontSize: '13px'
  },
});


interface IDropdownProps {
  open: boolean,
  handleClick: Function,
  referenceElement: HTMLElement,
}

const Dropdown: React.FunctionComponent<IDropdownProps> = ({
  open,
  handleClick,
  referenceElement,
  children,
}) => {
  if (!open) {
    return null;
  }

  const classes = useStyles();

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
                    <ClickAwayListener onClickAway={() => handleClick()}>
                      <MenuList>
                        {(children as React.ReactNode[]).map((child, index) => (
                          <MenuItem
                            classes={{root: classes.root}}
                            key={index}
                            onClick={(child as any)?.props?.onClick}
                          >
                            {child}
                          </MenuItem>
                        ))}
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