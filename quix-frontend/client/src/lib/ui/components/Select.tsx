import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, Input, List, ListItem, createStyles, makeStyles } from '@material-ui/core';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { grey } from '@material-ui/core/colors';
import _ from 'lodash';
import { useViewState } from '../../../services/hooks';

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
      color: grey[600]
    },
    list: {
      position: 'fixed',
      width: 'auto',
      minWidth: 200,
      zIndex: 200,
      willChange: 'top, left',
      backgroundColor: 'white',
      paddingTop: '5px',
      paddingBottom: '5px',
      '& li[data-focus="true"]': {
        backgroundColor: grey[50],
        cursor: 'pointer',
      },
      '&:hover $child': {
        color: 'red'
      }
    },
  })
);

const checkIsPlainData = (data) => ['string', 'number', 'undefined'].includes(typeof data);

const getOptionValue = (option, title) => checkIsPlainData(option) ? String(option) : option[title];

const States = [
  'FirstLoad',
  'Initial',
  'Open',
  'Error',
  'Result',
  'Content',
];

interface SelectOptions {
  options: string | number | Promise<any[]> | Function,
  title?: string,
  unique?: string,
  onOptionChange?: Function,
  defaultValue?: any,
  primaryValue?: any,
  placeHolder?: string,
  inputDataHook?: string,
  liDataHook?: string,
}

const Select = ({
  options,
  title,
  unique,
  onOptionChange,
  defaultValue,
  primaryValue,
  placeHolder = 'Enter your input',
  inputDataHook,
  liDataHook,
}: SelectOptions) => {

  const classes = useStyles();
  const [value, setValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const inputElement = useRef(null);
  const [stateData, viewState] = useViewState(States, {
    options: []
  });

  const primaryUniqueValue = getOptionValue(primaryValue, title);

  useEffect(() => {
    if (open && viewState.get() !== 'Open' && stateData.options.length === 0 && viewState.get() !== 'Error') {
      viewState.set('Open');
    }
  },[open]);

  useEffect(() => {
    switch (viewState.get()) {
      case 'FirstLoad':
        viewState.set('Initial');
        break;

      case 'Open': 
        let data;
        if (typeof options === 'function') {
          data = options();
        } else {
          data = options
        }
        Promise.resolve(data)
        .then(response => {
          if (viewState.get() === 'Open') {
            const fullData = primaryValue ? [primaryValue, ...response] : response;
            const viewStateType = response.length > 0 ? 'Content' : 'Result';
            viewState.set(viewStateType, { options: fullData });
          }
        })
        .catch(err => {
          if (viewState.get() === 'Open') {
            viewState.set('Error');
          }
        });
        break;

      default:
    }
  }, [viewState.get()]);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    options: stateData.options,
    value,
    onClose: () => setOpen(false),
    onOpen: () => setOpen(true),
    getOptionLabel: (option) => getOptionValue(option, title),
    onChange: (event, newValue) => {
      const newValueIndex = stateData.options.findIndex(option => _.isEqual(option, newValue));
      const selectedOptionUnique = getOptionValue(selectedOption, unique);
      const optionUnique = getOptionValue(stateData.options[newValueIndex], unique);

      if (newValueIndex !== -1 && selectedOptionUnique !== optionUnique) {
        setSelectedOption(stateData.options[newValueIndex]);
      }
      setValue(newValue);
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
          data-hook={inputDataHook}
        />
      </div>
      { open ?
        <List className={`${classes.list} bi-dropdown-menu`} {...getListboxProps()}>
          {{
          'Open': 
            <ListItem className={classes.loading}>
              <span>
                Loading...
              </span>
              <span>
                <CircularProgress color="inherit" size={20} />
              </span>
            </ListItem>,

          'Error': 
            <ListItem className={classes.bold}>
              <span>
                ERROR OCCURED
              </span>
            </ListItem>,
          
          'Result': 
            <ListItem>
              <span>
                No results found
              </span>
            </ListItem>,

          'Content': 
            groupedOptions.map((option, index) => {
              const currentOptionValue = getOptionValue(option, title);
              const selectedOptionValue = getOptionValue(selectedOption, title);
              if (currentOptionValue === primaryUniqueValue
                && selectedOptionValue === primaryUniqueValue
              ) {
                return;
              }

              let currentClassName
              if (primaryValue && (index === 0) && primaryUniqueValue === currentOptionValue) {
                currentClassName = classes.primaryOption;
              }
              else if (currentOptionValue === selectedOptionValue) {
                currentClassName = classes.bold;
              }

              return (
                <ListItem {...getOptionProps({ option, index })} className={currentClassName} data-hook={liDataHook}>
                  {checkIsPlainData(option) ? option : option[title]}
                </ListItem>
            )})

        }[viewState.get()]}
        </List> : null
      }
    </div>
  );
}

export default Select;