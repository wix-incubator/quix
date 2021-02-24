import React from 'react';
import { MenuItem as BaseMenuItem } from '@material-ui/core';
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

export const MenuItem = ({
  text,
  onClick,
}: IDropdownProps) => {
  const classes = useStyles();

  return (
    <BaseMenuItem
      classes={{root: classes.root}}
      onClick={() => typeof onClick === 'function' && onClick()}
    >
      {text}
    </BaseMenuItem>
  )
  
}