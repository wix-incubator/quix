import React from 'react';
import { MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
  root: {
    fontFamily: 'Open Sans',
    fontSize: '13px'
  },
});


interface IDropdownProps {
  text: string,
  onClick?: Function,
}

const SelectItem = ({
  text,
  onClick,
}: IDropdownProps) => {
  const classes = useStyles();

  return (
    <MenuItem
      classes={{root: classes.root}}
      onClick={() => typeof onClick === 'function' && onClick()}
    >
      {text}
    </MenuItem>
  )
  
}


export default SelectItem;