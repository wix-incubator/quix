import React, { useState, useEffect, useRef } from 'react';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { CircularProgress, Input, List, ListItem } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import gray from '@material-ui/core/colors/grey';

const useStyles = makeStyles(() =>
  createStyles({
    inputArea: {
      display: 'inline-grid',
    },
    label: {
      display: 'block',
    },
    loading: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    listbox: {
      width: 200,
      lineHeight: 'initial !important',
      fontSize: '13px',
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
        backgroundColor: gray[50],
        cursor: 'pointer',
      },
      '& li:active': {
        color: 'white',
      },
    },
  }),
);

export default function Select({
  options,
  title,
  unique,
  onChange,
  inputDefaultValue,
  placeHolder =  'Enter your input'
}) {

  // TODO: Make select work with number plain-data
  const isPlainData = options.length > 0 ? typeof options[0] === 'string' : true;
  const classes = useStyles();
  const [selectedOption, setSelectedOption] = useState(isPlainData ? '' : {});
  const [value, setValue] = useState(inputDefaultValue || '');
  const [open, setOpen] = useState(false);
  const [selectOptions, setSelectOptions] = useState([]);

  const loading = open && selectOptions.length === 0;
  let active = false;

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (!active) {
      active = true;
      Promise.resolve(options)
      .then(response => {
        if (active) {
          setSelectOptions(response);
          inputDefaultValue !== '' ? setValue(inputDefaultValue) : null;
          active = false;
        }
      });
    }
    return () => {
      active = false;
    }
  }, [loading]);

  const {
    getRootProps,
    // getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    options: selectOptions,
    value,
    onClose: () => setOpen(false),
    onOpen: () => setOpen(true),
    onChange: (event, newValue) => setValue(newValue),
    getOptionLabel: (option) => isPlainData ? option : option[title],
    getOptionSelected: (option, value) => {
      const optionUnique = isPlainData ? option : option[unique];
      const valueUnique = isPlainData ? value : value[unique];
      const selectedOptionUnique = isPlainData ? selectedOption : selectedOption[unique];
      const inputDefaultValueUnique = isPlainData ? inputDefaultValue : inputDefaultValue[unique];
      
      if (optionUnique === valueUnique) {
        if (selectedOptionUnique !== optionUnique) {
          if (inputDefaultValueUnique !== optionUnique) {
            onChange(option);
          }
          setSelectedOption(option);
        }
        return true;
      }
      return false;
    },
  });
  
  return (
    <div>
      <div {...getRootProps()} className={classes.inputArea}>
        <Input
          className={`bi-input`}
          {...getInputProps()}
          disableUnderline
          endAdornment={<ExpandMoreIcon fontSize='small' />}
          placeholder={placeHolder}
        />
      </div>
        {
          loading ? 
          <List className={`${classes.listbox} bi-dropdown-menu`} {...getListboxProps()}>
            <ListItem className={classes.loading}>
              <span>
                Loading...
              </span>
              <span>
                <CircularProgress color="inherit" size={20} />
              </span>
            </ListItem>
          </List>
          : 
          groupedOptions.length > 0 ? (
            <List className={`${classes.listbox} bi-dropdown-menu`} {...getListboxProps()}>
              {groupedOptions.map((option, index) => (
                <ListItem {...getOptionProps({ option, index })} >
                  {isPlainData ? option : option[title]}
                </ListItem>
              ))}
              </List>
          ) : null
        }
    </div>
  );
}