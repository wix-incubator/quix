import React, { useState } from 'react';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Input, List, ListItem } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(() =>
  createStyles({
    inputArea: {
      display: 'inline-grid',
    },
    label: {
      display: 'block',
    },
    input: {
      cursor: 'pointer',
    },
    listbox: {
      width: 200,
      lineHeight: 'initial !important',
      fontSie: '13px',
      margin: 0,
      padding: 0,
      zIndex: 1,
      position: 'absolute',
      listStyle: 'none',
      backgroundColor: 'white',
      overflow: 'auto',
      maxHeight: 200,
      border: '1px solid rgba(0,0,0,.25)',
      '& li[data-focus="true"]': {
        backgroundColor: '#FAFAFA',
        cursor: 'pointer',
      },
      '& li:active': {
        color: 'white',
      },
    },
  }),
);

export default function Select({ inputDescription, options, title, unique, setOption }) {
  const classes = useStyles();
  const [selectedOption, setSelectedOption] = useState({});
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    options,
    getOptionLabel: (option) => option[title],
    getOptionSelected: (option, value) => {
      if (option[unique] === value[unique]) {
        if (selectedOption[unique] !== option[unique]){
          setSelectedOption(option);
          setOption(option);
        }
        return true;
      }
      return false;
    },
  });

  return (
    <div>
      <div {...getRootProps()} className={classes.inputArea}>
        {inputDescription ? 
        <label className={'bi-form-label'} {...getInputLabelProps()}>
          {inputDescription}
        </label>
        : null
        }
        <Input className={`${classes.input} bi-input`} {...getInputProps()} disableUnderline endAdornment={<ExpandMoreIcon fontSize='small'/>} />
      </div>
      {groupedOptions.length > 0 ? (
        <List className={`${classes.listbox} bi-dropdown-menu`} {...getListboxProps()}>
          {groupedOptions.map((option, index) => (
              <ListItem {...getOptionProps({ option, index })}>
                {option[title]}
              </ListItem>
            ))}
        </List>
      ) : null}
    </div>
  );
}