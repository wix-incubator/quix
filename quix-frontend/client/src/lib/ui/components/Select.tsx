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
    bold: {
      fontWeight: 'bold'
    },
    primaryOption: {
      fontWeight: 'lighter'
    },
    listbox: {
      width: 200,
      zIndex: 1,
      position: 'absolute',
      backgroundColor: 'white',
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

const checkIsPlainData = (data) => ['string', 'number', 'undefined'].includes(typeof data);

const getOptionValue = (option, title) => checkIsPlainData(option) ? String(option) : option[title];

interface SelectOptions {
  options: string | number | Promise<any[]> | Function,
  title?: string,
  unique?: string,
  onOptionChange?: Function,
  defaultValue?: string | number,
  primaryValue?: string | number,
  placeHolder?: string,
}

const Select = ({
  options,
  title,
  unique,
  onOptionChange,
  defaultValue,
  primaryValue,
  placeHolder = 'Enter your input'
}: SelectOptions) => {

  const classes = useStyles();
  const [value, setValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const [selectOptions, setSelectOptions] = useState([]);
  const [isError, setIsError] = useState(false);

  const [selectedOption, setSelectedOption] = useState('');
  const inputElement = useRef(null);

  const loading = open && selectOptions.length === 0 && !isError;
  let active = false;

  const primaryUniqueValue = getOptionValue(primaryValue, title);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (!active && selectOptions.length === 0 && !isError) {
      active = true;
      let data;
      if (typeof options === 'function') {
        data = options();
      } else {
        data = options
      }
      Promise.resolve(data)
      .then(response => {
        if (active) {
          primaryValue ? setSelectOptions([primaryValue, ...response]) : setSelectOptions(response);
          active = false;
        }
      })
      .catch(err => {
        if (active) {
          setIsError(true);
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
    getOptionLabel: (option) => getOptionValue(option, title),
    getOptionSelected: (option, newValue) => {
      const optionUnique = getOptionValue(option, unique);
      const valueUnique = getOptionValue(newValue, unique);
      const selectedOptionUnique = getOptionValue(selectedOption, unique);
      
      if (optionUnique === valueUnique && !isError) {
        if (selectedOptionUnique !== optionUnique) {
          setSelectedOption(option);
        }
        return true;
      }
      return false;
    },
  });

  useEffect(() => {
    const optionUnique = getOptionValue(selectedOption, unique);
    const inputDefaultValueUnique = getOptionValue(defaultValue, unique);
    if (optionUnique !== '' && optionUnique !== inputDefaultValueUnique) {
      onOptionChange(selectedOption);
    }
  },[selectedOption]);
  
  return (
    <div>
      <div {...getRootProps()} className={classes.inputArea}>
        <Input
          className={`bi-input`}
          {...getInputProps()}
          disableUnderline
          inputRef={inputElement}
          endAdornment={
          <ExpandMoreIcon
            style={{cursor: 'pointer'}}
            fontSize='small'
            onClick={() => inputElement.current.focus()} />
          }
          placeholder={placeHolder}
        />
      </div>
      {
        open ?
        <List className={`${classes.listbox} bi-dropdown-menu`} {...getListboxProps()}>
          {
            loading && 
            <ListItem className={classes.loading}>
              <span>
                Loading...
              </span>
              <span> {/* TODO: change spinner to bi-react-app's spinner with same style */ }
                <CircularProgress color="inherit" size={20} />
              </span>
            </ListItem>
          }
          {
            isError && 
            <ListItem className={classes.bold}>
              <span>
                ERROR OCCURED
              </span>
            </ListItem>
          }
          {
            groupedOptions.length > 0 && 
            groupedOptions.map((option, index) => {
              const currentOptionValue = getOptionValue(option, title);
              const selectedOptionValue = getOptionValue(selectedOption, title);
              if (currentOptionValue === primaryUniqueValue
                && selectedOptionValue === primaryUniqueValue
              ) {
                return;
              }

              let currentClassName
              if (primaryValue && (index === 0)) {
                currentClassName = classes.primaryOption;
              }
              else if (currentOptionValue === selectedOptionValue) {
                currentClassName = classes.bold;
              }
              return (
              <ListItem {...getOptionProps({ option, index })} className={currentClassName} >
                {checkIsPlainData(option) ? option : option[title]}
              </ListItem>
            )})
          }
        </List>
        : null
      }
    </div>
  );
}

export default Select;